import { Client, Databases, Query, ID } from "appwrite"; 

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    // 1. Use Appwrite SDK to check if the searchTerm is present in the database or not;
    try {

        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm),
        ])
        
        // 2. If so , then increase the count
        if(result.documents.length > 0){
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count : doc.count + 1,
            })
        } else {
            // 3. If not, then create a new document which will have a count(default : 1) of this new searchTerm  
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm, 
                count : 1, 
                movie_id : movie.id,
                poster_url : `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })
        }

    } catch (error) {
        console.error(error);
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(11),
            Query.orderDesc("count"), 
        ])

        //returns a list , then in app.jsx we used useState of trending movies which accepts a list
        return result.documents;  
    } catch (error) {
        console.error(error);
    }
}