"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
    getApiEquipmentByIndex,
    getEquipmentCategories,
} from "../dnd-api/api-equipment";

// * Initialize Context
const DNDApiContext = createContext();
export const useDNDApi = () => {
    const context = useContext(DNDApiContext);
    if (context === undefined) {
        throw new Error("ussDNDApi must be used within a DNDApiProvider");
    }
    return context;
};

export const DNDApiProvider = ({ children }) => {
    const [apiItems, setAPIItems] = useState(0);
    const [selectedCat, setSelectedCat] = useState("");
    const [equipCatIndexes, setEquipCatIndexes] = useState([]);
    const [equipCatObjs, setEquipCatObjs] = useState([]);
    const [equipCatNames, setEquipCatNames] = useState([]);

    // equipment categories >> use categories url to get all items

    // ******** Categories Data **********

    // Get all equipment
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // 1. Fetch the categories objects
                const fetchedCategories = await getEquipmentCategories();
                setEquipCatObjs(fetchedCategories?.results);

                // 2. Use the categories obj to get the urls
                const catUrls = fetchedCategories.results.map(
                    (cat) => cat?.url
                );

                // 3. Fetch data for each URL
                const intermediateResults = await Promise.all(
                    catUrls.map((url) =>
                        fetch(`https://www.dnd5eapi.co${url}`).then((res) =>
                            res.json()
                        )
                    )
                );

                // 4. Extract equipment data from each intermediate result, then flatten into a single array
                let fetchedItems = intermediateResults.flatMap(
                    (result) => result.equipment || []
                );

                // 5. Fetch detailed data for each equipment item using `getApiEquipmentByIndex`
                const detailedItemsPromises = fetchedItems.map((item) => {
                    return item?.index
                        ? getApiEquipmentByIndex(item.index)
                        : null;
                });

                const detailedItems = await Promise.all(detailedItemsPromises);
                // Filter out any null or undefined values from detailedItems
                const filteredItems = detailedItems.filter(
                    (item) => item !== null && item !== undefined
                );

                // Set the detailed items to global state
                setAPIItems(filteredItems);
            } catch (error) {
                console.error("Error fetching categories: ", error);
            }
        };

        // Call the function
        fetchCategories();
    }, []);

    console.log(apiItems);

    // almost working code, trying different approach - delete if not needed
    // useEffect(() => {
    //     const fetchCategories = async () => {
    //         const catUrls = [];
    //         const fetchedItems = [];

    //         try {
    //             // fetch the categories objects
    //             const fetchedCategories = await getEquipmentCategories();
    //             setEquipCatObjs(fetchedCategories?.results); // Set fetched items to allItems state

    //             // use the categories obj just to get the urls
    //             await fetchedCategories.results.map((cat) => {
    //                 const url = cat?.url;
    //                 catUrls.push(url);
    //             });
    //             console.log(catUrls);

    //             // use the urls to get all items
    //             catUrls.map(async (url) => {
    //                 const res = await fetch(`https://www.dnd5eapi.co${url}`);
    //                 const data = await res.json();
    //                 data?.equipment?.map((item) => {
    //                     fetchedItems.push(item);
    //                 })
    //                 // set the items to global state
    //                 setAPIItems(fetchedItems);
    //                 console.log("api items: "+apiItems)
    //                 console.log("Item's state set successfully");
    //             });
    //         } catch (error) {
    //             console.error("Error fetching categories: ", error);
    //         }
    //     };

    //     // call the function
    //     fetchCategories();
    // }, []);

    const value = {
        apiItems,
    };

    return (
        <DNDApiContext.Provider value={value}>
            {children}
        </DNDApiContext.Provider>
    );
};
