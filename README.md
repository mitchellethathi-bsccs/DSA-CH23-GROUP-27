Members and roles
1.Mitchelle thathi-report,readme and YouTube video 
2.Carl mugo-post and likes 
3.Davine Chelagat -Timeline feed generation 
4.Gift ndegi -mutual friend and Friend recommendations 
5.Telvin mwika -search bar and auto complete 



# Curator - Social Network Application

A modern, full-stack social networking application built with React, TypeScript, Node.js, and MongoDB.

## Data Structures and Algorithms (DSA) Implementations

This project heavily utilizes specific data structures and algorithms to optimize performance and deliver a smooth user experience. You can find these implementations in `client/src
.

### 1. Merge Sort (Sorting & Ranking)
- **File**: `sorting.ts`
- **Use Case**: Ranks feed posts based on a composite score combining recency and engagement (likes, comments, shares).
- Why : Provides a guaranteed `O(n log n)` stable sort, ensuring that posts with identical engagement metrics maintain their relative chronological order. 

### 2. Binary Search 
- **File**: `sorting.ts`
- **Use Case**: Finding specific messages within a conversation history by their exact timestamp or locating the nearest chronological message.
- **Why**: Reduces search time in sorted arrays from `O(n)` to `O(log n)`, heavily optimizing message lookup in long conversation threads.

### 3. Graph & Breadth-First Search (BFS)
- **File**: `graph.ts`
- **Use Case**: Friend Suggestion Engine. Calculates "Friends of Friends" (distance exactly 2) to recommend new connections.
- **Why**: The adjacency list (`Map<string, Set<string>>`) allows `O(1)` edge lookups. BFS efficiently traverses the social graph in `O(V + E)` time to find strong mutual connections without deep recursive loops.

### 4. Doubly Linked List
- **File**: `linkedList.ts`
- **Use Case**: Managing dynamic conversation lists in the messaging interface.
- **Why**: Allows `O(1)` move-to-front operations. When a new message arrives in an older conversation, the Doubly Linked List instantly detaches that conversation's node and re-attaches it to the head of the list, ensuring active chats bubble to the top immediately.

### 5. Trie (Prefix Tree)
- **File**: `trie.ts`
- **Use Case**: Real-time Search Autocomplete for users and hashtags.
- **Why**: Provides `O(m)` insertion and `O(m + k)` search (where `m` is prefix length and `k` is number of results). Vastly outperforms standard `.filter()` and `.includes()` array lookups as the user database grows.

### 6. Queue (FIFO)
- **File**: `queue.ts`
- **Use Case**: Optimistic UI message send buffer.
- **Why**: Ensures that rapidly sent outgoing messages are processed sequentially (`O(1)` enqueue/dequeue amortized) while the UI optimistically renders them instantly.

---

## 🚀 How to Setup and Run Locally

To get this project running on your local machine, follow these steps:

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally, or use a MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone <your-repo-link>
cd social-network-app
```

### 2. Setup the Backend (server)
Open a terminal and navigate to the `server` directory:
```bash
cd server

# Install dependencies
npm install

# Create environment variables file
# Create a .env file based on the example (or add your own standard dev keys)
echo "PORT=5000" > .env
echo "MONGO_URI=mongodb://127.0.0.1:27017/curator_db" >> .env
echo "JWT_SECRET=super_secret_jwt_key_123" >> .env
echo "NODE_ENV=development" >> .env

# Start the development server
npm run dev
```
*The backend should now be running on `http://localhost:5000` connected to your local MongoDB.*

### 3. Setup the Frontend (client)
Open a *new* terminal window and navigate to the `client` directory:
```bash
cd client

# Install dependencies
npm install

# (Optional) If your backend is not on port 5000, ensure proxy in vite.config.ts matches
# Start the development server
npm run dev
```
*The frontend should now be running on `http://localhost:5173`. Open this URL in your browser.*

### Default Admin Scripts
If you need to make your first account an administrator for testing the Admin Dashboard, use the provided script from the root/server directory:
```bash
npx tsx makeAdmin.ts <your_account_email_here>
```


