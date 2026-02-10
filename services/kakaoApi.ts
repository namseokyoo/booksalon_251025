
import { Book } from '../types';

// Kakao Book Search API 응답 타입
interface KakaoBookDocument {
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
  thumbnail: string;
  contents: string;
}

interface KakaoBookSearchResponse {
  documents: KakaoBookDocument[];
  meta: {
    is_end: boolean;
    pageable_count: number;
    total_count: number;
  };
}

// 카카오 API 키 설정 (환경 변수에서 가져오기)
const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY || process.env.KAKAO_API_KEY;

const API_URL = 'https://dapi.kakao.com/v3/search/book';

export async function searchBookByIsbn(isbn: string): Promise<Book | null> {
  if (!KAKAO_API_KEY) {
    return null;
  }

  try {
    const url = `${API_URL}?target=isbn&query=${isbn}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data: KakaoBookSearchResponse = await response.json();

    if (data.documents && data.documents.length > 0) {
      const bookData: KakaoBookDocument = data.documents[0];

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
  } catch {
    return null;
  }
}

export async function searchBookByTitle(title: string): Promise<Book[]> {
  if (!KAKAO_API_KEY) {
    return [];
  }

  try {
    const url = `${API_URL}?query=${encodeURIComponent(title)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data: KakaoBookSearchResponse = await response.json();

    if (data.documents && data.documents.length > 0) {
      const books = data.documents.map((bookData: KakaoBookDocument) => {
        // Kakao API returns ISBN with a space sometimes (e.g., "8937462428 9788937462424")
        const cleanIsbn = bookData.isbn ? bookData.isbn.split(' ')[0] : 'unknown';
        return {
          isbn: cleanIsbn,
          title: bookData.title,
          authors: bookData.authors,
          publisher: bookData.publisher,
          thumbnail: bookData.thumbnail,
          contents: bookData.contents,
        };
      });
      return books;
    }

    return [];
  } catch {
    return [];
  }
}
