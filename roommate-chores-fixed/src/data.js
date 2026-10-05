export const roommates = [
  { id: "king", username: "King", displayName: "King", password: "Anie" },
  { id: "mama-davis", username: "Mama Davis", displayName: "Mama Davis", password: "Kemal" },
  { id: "fart", username: "Fart", displayName: "Fart", password: "Ale" },
  { id: "bbg", username: "BBG", displayName: "BBG", password: "Jae" }
];

export const chores = [
  { id: "dishes", name: "Dishes", emoji: "🍽️", description: "Wash dishes and keep the sink clean." },
  { id: "trash", name: "Trash", emoji: "🗑️", description: "Take out the trash and replace the bags." },
  { id: "bathroom", name: "Bathroom", emoji: "🛁", description: "Clean the bathroom and restock supplies." },
  { id: "vacuum", name: "Vacuum", emoji: "🧹", description: "Vacuum the floors throughout the house." },
  { id: "laundry", name: "Laundry", emoji: "🧺", description: "Handle shared laundry and keep the laundry area tidy." },
  { id: "kitchen", name: "Kitchen", emoji: "🧽", description: "Wipe counters, clean surfaces, and tidy the kitchen." }
];

export const eligibleRoommates = {
  dishes: ["king", "mama-davis", "fart", "bbg"],
  trash: ["mama-davis", "fart", "bbg"],
  bathroom: ["king", "mama-davis", "fart", "bbg"],
  vacuum: ["king", "mama-davis", "fart", "bbg"],
  laundry: ["king", "mama-davis", "fart", "bbg"],
  kitchen: ["king", "mama-davis", "fart", "bbg"]
};