import { useEffect, useState } from "react";
import "./examples.css";
import { useContractUtils } from "@/app/hooks";
import { useContext } from "react";
import { dAppContext } from "@/Context/dappContext";
// import { Button } from "@/components/ui/button";
import { web3FromSource } from "@polkadot/extension-dapp";
import { ProgramMetadata, encodeAddress } from "@gear-js/api";
import { CONTRACT } from "@/app/consts";
import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";

import { Flex, Heading, Input, Button, Text, Box } from "@chakra-ui/react";
import { Metadata } from "@polkadot/types";
import { get } from "http";

import bgImage from "../../assets/images/Firefly abstract wa.jpg";

function Home() {
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
  //get USDC balance

  const { api } = useApi();
  const { accounts, account } = useAccount();

  const alert = useAlert();

  const [balance, setBalance] = useState<any | undefined>(0);

  const [fullState, setFullState] = useState<any | undefined>({});

  const Localbalances = fullState.balances || [];

  // USDC program ID
  const programIDFT =
    "0xd8d0206ab4a4d0f26f80a28594e767d62bf1d5ff436c8c79e819a97399b7eaa7";

  // USDC metadata.txt
  const meta =
    "00010001000000000001030000000107000000000000000108000000a90b3400081466745f696f28496e6974436f6e66696700000c01106e616d65040118537472696e6700011873796d626f6c040118537472696e67000120646563696d616c73080108753800000400000502000800000503000c081466745f696f204654416374696f6e000118104d696e74040010011075313238000000104275726e040010011075313238000100205472616e736665720c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380002001c417070726f7665080108746f14011c4163746f724964000118616d6f756e74100110753132380003002c546f74616c537570706c790004002442616c616e63654f66040014011c4163746f724964000500001000000507001410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004001801205b75383b2033325d0000180000032000000008001c081466745f696f1c46544576656e74000110205472616e736665720c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380000001c417070726f76650c011066726f6d14011c4163746f724964000108746f14011c4163746f724964000118616d6f756e74100110753132380001002c546f74616c537570706c790400100110753132380002001c42616c616e63650400100110753132380003000020081466745f696f3c496f46756e6769626c65546f6b656e00001801106e616d65040118537472696e6700011873796d626f6c040118537472696e67000130746f74616c5f737570706c791001107531323800012062616c616e6365732401505665633c284163746f7249642c2075313238293e000128616c6c6f77616e6365732c01905665633c284163746f7249642c205665633c284163746f7249642c2075313238293e293e000120646563696d616c730801087538000024000002280028000004081410002c00000230003000000408142400";

  const metadata = ProgramMetadata.from(meta);

  const handleClick = () => {
    //BOND program ID
    const programIDFTBond =
      "0x228c61da585fb256b2761c9250b0588dcdd11458035f23731d51c945a05a9231";
    // Add your metadata.txt
    const metaBond =
      "0002000100000000000105000000010600000000000000000107000000090b38000808696f20496e6974426f6e6400000c0148737461626c65636f696e5f6164647265737304011c4163746f724964000130626f6e645f6164647265737304011c4163746f72496400011470726963651001107531323800000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100000050700140808696f28426f6e64416374696f6e0001041c427579426f6e6404001001107531323800000000180808696f24426f6e644576656e7400011c084f6b0000000c45727200010028426f6e64426f756768740400100110753132380002001c50746f6b656e7304001001107531323800030024426f6e6456616c75650400100110753132380004002c426f6e6442616c616e63650400100110753132380005003450746f6b656e42616c616e6365040010011075313238000600001c0808696f10426f6e6400002401146f776e657204011c4163746f724964000148737461626c65636f696e5f6164647265737304011c4163746f724964000130626f6e645f6164647265737304011c4163746f72496400013c705f746f6b656e5f6164647265737304011c4163746f724964000134626f6e64735f656d69747465641001107531323800011470726963651001107531323800013476657374696e675f626c6f636b20010c75333200013c746f74616c5f6465706f736974656410011075313238000130626f6e645f686f6c6465727324017442547265654d61703c4163746f7249642c20426f6e64486f6c6465723e000020000005050024042042547265654d617008044b01040456012800040030000000280808696f28426f6e64486f6c6465720000080124705f62616c616e63651001107531323800011c656d69747465642c0110626f6f6c00002c00000500003000000234003400000408042800";

    const metadataBond = ProgramMetadata.from(metaBond);

    const messageApprove: any = {
      destination: programIDFT, // programId
      payload: { Approve: programIDFTBond, inputValue: Number(inputValue) },
      gasLimit: 8998192450,
      value: 0,
    };

    const signer = async () => {
      const localaccount = account?.address;
      const isVisibleAccount = accounts.some(
        (visibleAccount) => visibleAccount.address === localaccount
      );

      if (isVisibleAccount) {
        // Create a message extrinsic
        const transferExtrinsicApprove = await api.message.send(
          messageApprove,
          metadata
        );
        // const transferExtrinsic = await api.message.send(message, metadataBond);

        const injector = await web3FromSource(accounts[0].meta.source);

        transferExtrinsicApprove
          .signAndSend(
            account?.address ?? alert.error("No account"),
            { signer: injector.signer },
            ({ status }) => {
              if (status.isInBlock) {
                alert.success(status.asInBlock.toString());
              } else {
                console.log("in process");
                if (status.type === "Finalized") {
                  alert.success(status.type);
                }
              }
            }
          )
          .catch((error: any) => {
            console.log(":( transaction failed", error);
          });
      } else {
        alert.error("Account not available to sign");
      }
    };
    signer();

    console.log("Approve action performed");
  };
  const handleClickSend = () => {
    const programIDFTBond =
      "0x8004689c0ce66ceac9f323633d8aabdc30c12ea8dd89f494ef367f7aa0b56a3f";
    // Add your metadata.txt
    const metaBond =
      "0002000100000000000105000000010600000000000000000107000000690a38000808696f20496e6974426f6e640000080148737461626c65636f696e5f6164647265737304011c4163746f72496400011470726963651001107531323800000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100000050700140808696f28426f6e64416374696f6e0001041c427579426f6e6404001001107531323800000000180808696f24426f6e644576656e7400011c084f6b0000000c45727200010028426f6e64426f756768740400100110753132380002001c50746f6b656e7304001001107531323800030024426f6e6456616c75650400100110753132380004002c426f6e6442616c616e63650400100110753132380005003450746f6b656e42616c616e6365040010011075313238000600001c0808696f34496f476c6f62616c537461746500002001146f776e657204011c4163746f724964000148737461626c65636f696e5f6164647265737304011c4163746f72496400013c705f746f6b656e5f6164647265737304011c4163746f724964000134626f6e64735f656d6d697465641001107531323800011470726963651001107531323800013076657374696e675f74696d6520010c75363400013c746f74616c5f6465706f736974656410011075313238000130626f6e645f686f6c6465727324017442547265654d61703c4163746f7249642c20426f6e64486f6c6465723e000020000005060024042042547265654d617008044b01040456012800040030000000280808696f28426f6e64486f6c6465720000080124705f62616c616e63651001107531323800011c656d6d697465642c0118537472696e6700002c00000502003000000234003400000408042800";

    const metadataBond = ProgramMetadata.from(metaBond);

    const messageApprove: any = {
      destination: programIDFT, // programId
      payload: { Approve: programIDFTBond, inputValue: Number(inputValue) },
      gasLimit: 8998192450,
      value: 0,
    };

    const message: any = {
      destination: programIDFTBond, // programId
      payload: { BuyBond: Number(inputValue) },
      gasLimit: 8998192450,
      value: 0,
    };

    const signer = async () => {
      const localaccount = account?.address;
      const isVisibleAccount = accounts.some(
        (visibleAccount) => visibleAccount.address === localaccount
      );

      if (isVisibleAccount) {
        // Create a message extrinsic
        const transferExtrinsicApprove = await api.message.send(
          messageApprove,
          metadata
        );
        const transferExtrinsic = await api.message.send(message, metadataBond);

        const injector = await web3FromSource(accounts[0].meta.source);

        transferExtrinsic
          .signAndSend(
            account?.address ?? alert.error("No account"),
            { signer: injector.signer },
            ({ status }) => {
              if (status.isInBlock) {
                alert.success(status.asInBlock.toString());
              } else {
                console.log("in process");
                if (status.type === "Finalized") {
                  alert.success(status.type);
                }
              }
            }
          )
          .catch((error: any) => {
            console.log(":( transaction failed", error);
          });
      } else {
        alert.error("Account not available to sign");
      }
    };
    signer();

    console.log("BUY action performed");
  };

  const getBalance = () => {
    api.programState
      .read({ programId: programIDFT, payload: "" }, metadata)
      .then((result) => {
        setFullState(result.toJSON());
        // console.log("Full State", fullState);
      })
      .catch(({ message }: Error) => alert.error(message));

    Localbalances.some(([address, balances]: any) => {
      if (encodeAddress(address) === account?.address) {
        setBalance(balances);
        console.log("Balances", balance);

        return true;
      }
      return false;
    });
  };

  useEffect(() => {
    getBalance();
  });

  return (
    <Flex flexDir="column" justify="center">
      <Flex pt="4rem" justify="center" bgImage={bgImage} w="100%" h="18rem">
        {" "}
        <Heading color="black" mt="2rem" alignSelf="center">
          Buy Bond
        </Heading>
      </Flex>

      <Flex alignSelf="center">
        <Flex
          p="2rem"
          borderWidth="1px"
          borderColor="grey"
          mt="2rem"
          justify="center"
          borderRadius="2rem"
        >
          <Box>
            <Text>Input the amount of USDC that you want to spend</Text>
            <Text ml="12rem">USDC Available:{balance}</Text>
            <Flex mt="1rem" justify="center">
              <Input
                placeholder="USDC amount"
                value={inputValue} // Controlled component
                onChange={handleInputChange}
              ></Input>
              {/* <Button onClick={handleClick}>Approve Bond</Button> */}
              <Button onClick={handleClickSend}>Buy Bond</Button>
            </Flex>
          </Box>
        </Flex>

        <Flex mt="4rem" flexDir="column" ml="2rem">
          <Heading alignSelf="center">Bond Details</Heading>
          <Text>Current market price: 4.1 USDC</Text>
          <Text>Current bond price: 3.0 USDC</Text>
          <Text>Bond Disscount: 30%</Text>
          <Text>Vesting Period: 15 blocks</Text>
        </Flex>
      </Flex>
      <Flex
        p="1rem"
        borderWidth="1px"
        borderColor="grey"
        bgColor="#035BFE"
        alignSelf="center"
        flexDir="column"
        mt="4rem"
        justify="center"
        borderRadius="2rem"
      >
        <Heading color="white">You receive</Heading>
        <Text color="white" fontSize="1.3rem">
          {tokensReceived} pTokens
        </Text>
      </Flex>
    </Flex>
  );
}

export { Home };
