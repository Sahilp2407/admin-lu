import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Fetches all documents from the 'enquiries' collection in Firestore.
 * Requires the user to be authenticated as an admin based on Security Rules.
 * 
 * @returns {Promise<Array>} Array of enquiry objects
 */
export const fetchEnquiries = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "enquiries"));
        const enquiries = [];
        querySnapshot.forEach((doc) => {
            enquiries.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return enquiries;
    } catch (error) {
        console.error("Error fetching enquiries:", error);
        throw error;
    }
};
