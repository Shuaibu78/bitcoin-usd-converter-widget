import BTCConverterWidget from "./components/BitcoinWidget";
import { Box } from "@chakra-ui/react";

function App() {
  return (
    <Box
      width={"100%"}
      height={"100vh"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <BTCConverterWidget />
    </Box>
  );
}

export default App;
