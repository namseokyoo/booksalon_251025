
import { Book } from '../types';

const KAKAO_API_KEY = process.env.KAKAO_API_KEY; // IMPORTANT: Set this in your environment.

const API_URL = 'https://dapi.kakao.com/v3/search/book?target=isbn';

export async function searchBookByIsbn(isbn: string): Promise<Book | null> {
  if (!KAKAO_API_KEY) {
    console.error("Kakao API key is not set. Please set process.env.KAKAO_API_KEY.");
    return null;
  }

  try {
    const response = await fetch(`${API_URL}&query=${isbn}`, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch book from Kakao API');
    }

    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
      const bookData = data.documents[0];
      // Kakao API returns ISBN with a space sometimes (e.g., "8937462428 9788937462424")
      const cleanIsbn = bookData.isbn.split(' ')[0]; 
      return {
        isbn: cleanIsbn,
        title: bookData.title,
        authors: bookData.authors,
        publisher: bookData.publisher,
        thumbnail: bookData.thumbnail,
        contents: bookData.contents,
      };
    }

    return null;
  } catch (error) {
    console.error('Error searching book by ISBN:', error);
    return null;
  }
}
