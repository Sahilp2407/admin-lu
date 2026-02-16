import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Fetches all documents from both 'free_enquiries' and 'paid_enquiries' collections in Firestore.
 * Requires the user to be authenticated as an admin based on Security Rules.
 * 
 * @returns {Promise<Array>} Array of enquiry objects from both collections
 */
export const fetchEnquiries = async () => {
    try {
        // Fetch from free_enquiries collection
        const freeQuerySnapshot = await getDocs(collection(db, "free_enquiries"));
        const freeEnquiries = [];
        freeQuerySnapshot.forEach((doc) => {
            freeEnquiries.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Fetch from paid_enquiries collection
        const paidQuerySnapshot = await getDocs(collection(db, "paid_enquiries"));
        const paidEnquiries = [];
        paidQuerySnapshot.forEach((doc) => {
            paidEnquiries.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Combine both arrays
        const allEnquiries = [...freeEnquiries, ...paidEnquiries];

        console.log(`✅ Fetched ${freeEnquiries.length} free enquiries and ${paidEnquiries.length} paid enquiries`);
        console.log(`📊 Total enquiries: ${allEnquiries.length}`);

        return allEnquiries;
    } catch (error) {
        console.error("❌ Error fetching enquiries:", error);
        if (error.code === 'permission-denied') {
            console.warn("⚠️ Permission denied - this is expected if Firestore rules restrict access");
        }
        throw error;
    }
};
