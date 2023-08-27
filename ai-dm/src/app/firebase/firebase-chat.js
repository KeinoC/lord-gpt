import { realtimeDB } from "./firebase-config";
const {
    ref,
    set,
    orderByChild,
    limitToLast,
    query,
    get,
} = require("firebase/database");

export async function sendAdvMessage(adventure, currentUser, message) {
    try {
        if (!adventure) {
            throw new Error("Invalid Adventure");
        }

        if (!currentUser) {
            throw new Error("Invalid User as Sender");
        }

        if (message.length < 1) {
            throw new Error("Invalid Message");
        }

        const sender = currentUser?.username.toLowerCase();
        const newMessageRef = ref(
            realtimeDB,
            `chat/adventure-chat/${adventure?.id}/${Date.now()}`
            )

            if (!newMessageRef) {
                throw new Error("Invalid Message Ref")
            }
            const newMessage = {
                sender: sender,
                message: message,
                timestamp: Date.now(),
            };

        await set(newMessageRef, newMessage);
    } catch (error) {
        console.error(error);
    }
}

export async function sendGlobalMessage(currentUser, message) {
    try {

        if (!currentUser) {
            throw new Error("Invalid User as Sender");
        }

        if (message.length < 1) {
            throw new Error("Invalid Message");
        }

        const sender = currentUser?.username.toLowerCase();
        const newMessageRef = ref(
            realtimeDB,
            `chat/global-chat/${Date.now()}}`
            )

            if (!newMessageRef) {
                throw new Error("Invalid Message Ref")
            }
            const newMessage = {
                sender: sender,
                message: message,
                timestamp: Date.now(),
            };

        await set(newMessageRef, newMessage);
    } catch (error) {
        console.error(error);
    }
}

async function testDataRetrieval() {
    try {
        // Reference to the specific path "global/shenanigans"
        const specificPathRef = ref(realtimeDB, "global/shenanigans");

        // Fetch the value at the specific path
        const snapshot = await get(specificPathRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            // console.log("Fetched data:", data);
        } else {
            console.log("No data found at the specified path");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Call the function to test data retrieval
// testDataRetrieval();

export async function getChatHistoryByChannel(channel, roomId) {
    try {
        const chatPathRef = ref(realtimeDB, channel + "/" + roomId);
        const snapshot = await get(chatPathRef);

        if (snapshot.exists()) {
            return Object.values(snapshot.val()).sort(
                (a, b) => a.timestamp - b.timestamp
            );
        } else {
            console.log("No messages found");
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function deleteMessage(channel, messageId, roomId) {
    try {
        const messageRef = ref(realtimeDB, `${channel}/${roomId}/${messageId}`);
        await remove(messageRef);
    } catch (error) {
        console.error(error);
    }
}

export async function editMessage(channel, messageId, newContent, roomId) {
    try {
        const messageRef = ref(realtimeDB, `${channel}/${roomId}/${messageId}`);
        await update(messageRef, { message: newContent });
    } catch (error) {
        console.error(error);
    }
}

export async function getMessageById(channel, messageId, roomId) {
    try {
        const messageRef = ref(realtimeDB, `${channel}/${roomId}/${messageId}`);
        const snapshot = await get(messageRef);
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getOlderMessages(
    channel,
    earliestTimestamp,
    limit = 100,
    roomId
) {
    const globalChatRef = ref(realtimeDB, `${channel}/${roomId}`);
    const messagesQuery = query(
        globalChatRef,
        orderByChild("timestamp"),
        endAt(earliestTimestamp - 1),
        limitToLast(limit)
    );

    const snapshot = await get(messagesQuery);
    if (snapshot.exists()) {
        return Object.values(snapshot.val()).sort(
            (a, b) => a.timestamp - b.timestamp
        );
    } else {
        return [];
    }
}
