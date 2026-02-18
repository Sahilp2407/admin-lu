import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Fetches all documents from both 'free_enquiries' and 'paid_enquiries' collections in Firestore.
 * Each document is tagged with a `_source` field: 'free' or 'paid'.
 *
 * @returns {Promise<{ freeEnquiries: Array, paidEnquiries: Array, allEnquiries: Array }>}
 */
export const fetchEnquiries = async () => {
    try {
        // Fetch from free_enquiries collection (lp.letsupgrade.in)
        const freeQuerySnapshot = await getDocs(collection(db, "free_enquiries"));
        const freeEnquiries = [];
        freeQuerySnapshot.forEach((doc) => {
            freeEnquiries.push({
                id: doc.id,
                _source: 'free',
                ...doc.data()
            });
        });

        // Fetch from paid_enquiries collection (ai.letsupgrade.in)
        const paidQuerySnapshot = await getDocs(collection(db, "paid_enquiries"));
        const paidEnquiries = [];
        paidQuerySnapshot.forEach((doc) => {
            paidEnquiries.push({
                id: doc.id,
                _source: 'paid',
                ...doc.data()
            });
        });

        const allEnquiries = [...freeEnquiries, ...paidEnquiries];

        console.log(`✅ Fetched ${freeEnquiries.length} free enquiries (lp.letsupgrade.in) and ${paidEnquiries.length} paid enquiries (ai.letsupgrade.in)`);
        console.log(`📊 Total enquiries: ${allEnquiries.length}`);

        return { freeEnquiries, paidEnquiries, allEnquiries };
    } catch (error) {
        console.error("❌ Error fetching enquiries:", error);
        if (error.code === 'permission-denied') {
            console.warn("⚠️ Permission denied - this is expected if Firestore rules restrict access");
        }
        throw error;
    }
};
