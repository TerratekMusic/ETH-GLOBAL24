import { useEffect, useState } from "react";
import "./examples.css";
import { useContractUtils } from "@/app/hooks";
import { useContext } from "react";
import { dAppContext } from "@/Context/dappContext";
// import { Button } from "@/components/ui/button";
import { CONTRACT } from "@/app/consts";
import { useAccount } from "@gear-js/react-hooks";
import {
  NormalButtons,
  VoucherButtons,
  SignlessButtons,
} from "@/components/ExampleComponents";
import { Flex, Heading, Input, Button, Text, Box } from "@chakra-ui/react";

function Home() {
  const { account } = useAccount();
  const { currentVoucherId, setCurrentVoucherId, setSignlessAccount } =
    useContext(dAppContext);
  const { readState } = useContractUtils();

  const [pageSignlessMode, setPageSignlessMode] = useState(false);
  const [voucherModeInPolkadotAccount, setVoucherModeInPolkadotAccount] =
    useState(false);
  const [contractState, setContractState] = useState("");

  const [tokensReceived, setTokensReceived] = useState("");

  const [inputValue, setInputValue] = useState("");
  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setInputValue(event.target.value);
  };

  function calculateTokensReceived(inputValue: number) {
    const tokensReceived = (inputValue / 3).toString();
    setTokensReceived(tokensReceived);
  }

  useEffect(() => {
    calculateTokensReceived(Number(inputValue));
  }, [inputValue]);

  useEffect(() => {
    if (!account) {
      setPageSignlessMode(true);
    } else {
      setPageSignlessMode(false);
    }
    if (setCurrentVoucherId) setCurrentVoucherId(null);
  }, [account]);

  console.log("usdcAmount", inputValue);

  return (
    <Flex flexDir="column" justify="center">
      <Heading alignSelf="center">Buy Bond</Heading>
      <Flex alignSelf="center">
        <Flex mt="4rem" justify="center">
          <Box>
            <Text>Input the amount of USDC that you want to spend</Text>
            <Text ml="12rem">USDC Available:</Text>
            <Flex mt="1rem" justify="center">
              <Input
                placeholder="USDC amount"
                value={inputValue} // Controlled component
                onChange={handleInputChange}
              ></Input>
              <Button>Buy Bond</Button>
            </Flex>
          </Box>
        </Flex>

        <Flex mt="4rem" flexDir="column" ml="2rem">
          <Heading alignSelf="center">Bond Details</Heading>
          <Text>Current market price: 4.1 USDC</Text>
          <Text>Current bond price: 3.0 USDC</Text>
          <Text>Bond Disscount: 30%</Text>
          <Text>Vesting Period: 7 blocks</Text>
        </Flex>
      </Flex>
      <Flex alignSelf="center" flexDir="column" mt="4rem" justify="center">
        <Heading>You receive</Heading>
        <Text fontSize="1.3rem">{tokensReceived} pTokens</Text>
      </Flex>
    </Flex>
  );
}

export { Home };
