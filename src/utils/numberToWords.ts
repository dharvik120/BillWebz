// Convert a number into words. Supports Indian Rupee (INR) and International standard formats.

const singleDigits = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
const teenDigits = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const doubleDigits = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

// Helper: Convert a number below 1000 into words
function convertLessThanThousand(num: number): string {
  if (num === 0) return "";
  
  let result = "";
  
  if (num >= 100) {
    result += singleDigits[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }
  
  if (num >= 20) {
    result += doubleDigits[Math.floor(num / 10)] + " ";
    num %= 10;
  } else if (num >= 10) {
    result += teenDigits[num - 10] + " ";
    num = 0;
  }
  
  if (num > 0) {
    result += singleDigits[num] + " ";
  }
  
  return result.trim();
}

// Convert using Indian numbering format (Lakh, Crore)
function convertIndianFormat(num: number): string {
  if (num === 0) return "Zero";
  
  let result = "";
  
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  
  if (crore > 0) {
    result += convertLessThanThousand(crore) + " Crore ";
  }
  
  if (lakh > 0) {
    result += convertLessThanThousand(lakh) + " Lakh ";
  }
  
  if (thousand > 0) {
    result += convertLessThanThousand(thousand) + " Thousand ";
  }
  
  if (num > 0) {
    result += convertLessThanThousand(num);
  }
  
  return result.trim();
}

// Convert using International format (Million, Billion)
function convertInternationalFormat(num: number): string {
  if (num === 0) return "Zero";
  
  let result = "";
  
  const billion = Math.floor(num / 1000000000);
  num %= 1000000000;
  
  const million = Math.floor(num / 1000000);
  num %= 1000000;
  
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  
  if (billion > 0) {
    result += convertLessThanThousand(billion) + " Billion ";
  }
  
  if (million > 0) {
    result += convertLessThanThousand(million) + " Million ";
  }
  
  if (thousand > 0) {
    result += convertLessThanThousand(thousand) + " Thousand ";
  }
  
  if (num > 0) {
    result += convertLessThanThousand(num);
  }
  
  return result.trim();
}

export function numberToWords(amount: number, currencyCode: string = "INR"): string {
  if (isNaN(amount) || amount === null) return "Zero";
  
  const mainPart = Math.floor(amount);
  const decimalPart = Math.round((amount - mainPart) * 100);
  
  const isINR = currencyCode === "INR";
  
  let words = isINR ? convertIndianFormat(mainPart) : convertInternationalFormat(mainPart);
  
  if (currencyCode === "INR") {
    words = words + " Rupees";
  } else if (currencyCode === "USD") {
    words = words + " Dollars";
  } else if (currencyCode === "EUR") {
    words = words + " Euros";
  } else if (currencyCode === "AED") {
    words = words + " Dirhams";
  } else {
    words = words + " " + currencyCode;
  }
  
  if (decimalPart > 0) {
    let decimalWords = isINR ? convertIndianFormat(decimalPart) : convertInternationalFormat(decimalPart);
    if (isINR) {
      words += " and " + decimalWords + " Paise";
    } else {
      words += " and " + decimalWords + " Cents";
    }
  }
  
  return words + " Only";
}
