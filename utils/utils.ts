export function extractInteger(text: string) {
    const match = text.match(/\d+/); // Match one or more digits
    return match ? parseInt(match[0], 10) : null; // Convert matched string to integer
  }
  
  export function extractYear(text: string) {
    const year = text.match(/\d{4}/);
    return year ? year[0] : '';
  }
  