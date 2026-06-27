// convex/getLiveAlerts.ts
import { query } from "./_generated/server";

export const getLiveAlerts = query(async ({ db }) => {
   const alerts = await db.query("alerts").order("desc").collect();

   const results = await Promise.all(
      alerts.map(async (alert) => {
         const full = await db.get(alert._id);
         const user = await db.get(alert.userId);
         return {
            _id: alert._id,
            category: alert.category,
            location: alert.location,
            alertLevel: alert.alertLevel,
            latitude: alert.latitude,
            longitude: alert.longitude,
            userName: user
               ? [user.firstname, user.lastname].filter(Boolean).join(" ")
               : alert.userName || "Unknown",
            contactNumber: user ? user.contactNumber || "" : "",
            _creationTime: full._creationTime,
            resolvedTime: alert.resolvedTime || null,
            status: alert.status || "active",
            description: alert.description || "",
            relatedCategory: alert.relatedCategory || "",
            responder: alert.responder || "",
         };
      })
   );

   return results;
});
