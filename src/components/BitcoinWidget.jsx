import { Box, Text, Input, Button, Spinner, useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";

// Custom hook for debouncing input values
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const BTCConverterWidget = () => {
  const [usd, setUsd] = useState(""); // User input in USD
  const [btc, setBtc] = useState("--"); // Converted BTC amount
  const [price, setPrice] = useState(null); // BTC price in USD
  const [loading, setLoading] = useState(false); // Loading state for fetching price
  const [timestamp, setTimestamp] = useState(""); // Last updated timestamp
  const toast = useToast(); // Toast for error and success messages

  const debouncedUsd = useDebounce(usd, 500); // Debounced USD input value

  // Fetches the current BTC price from CoinGecko API
  const fetchBTCPrice = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      const btcPrice = response.data.bitcoin.usd;
      setPrice(btcPrice);
      setTimestamp(new Date().toLocaleString());
    } catch (error) {
      toast({
        title: "Error fetching data.",
        description: "Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Runs on component mount to fetch the price initially
  useEffect(() => {
    fetchBTCPrice();
  }, []);

  // Updates BTC equivalent when USD input changes and price is available
  useEffect(() => {
    if (price && debouncedUsd) {
      setBtc((debouncedUsd / price).toFixed(8));
    }
  }, [debouncedUsd, price]);

  // Formats numbers with commas
  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handles user input, formats the number, and validates it
  const handleInput = (e) => {
    let rawValue = e.target.value.replace(/,/g, ""); // Remove commas for calculations
    const value = parseFloat(rawValue);

    if (value > 100000000) {
      toast({
        title: "Input Limit Exceeded.",
        description: "The maximum allowed input is $100,000,000.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUsd(formatNumber(rawValue)); // Format number with commas
  };

  return (
    <Box
      maxW="450px"
      p="6"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      textAlign="center"
    >
      <Text fontSize="xl" mb="4">
        Bitcoin Price Converter
      </Text>
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <>
          <Text mb="2">Current Price: ${price}</Text>
          <Text mb="2">Last Updated: {timestamp}</Text>
          <Input
            placeholder="Enter USD amount"
            type="text" // Set to text to handle formatted numbers
            value={usd}
            onChange={handleInput}
            mb="4"
            isInvalid={parseFloat(usd.replace(/,/g, "")) > 100000000}
          />
          <Text mb="4">BTC Equivalent: {btc}</Text>
          <Button onClick={fetchBTCPrice} colorScheme="blue">
            Refresh Price
          </Button>
        </>
      )}
    </Box>
  );
};

export default BTCConverterWidget;
