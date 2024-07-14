import { Link } from "react-router-dom";
import "./logo.module.scss";
import { Image } from "@chakra-ui/react";
import logo from "../../../../assets/images/SPBondLogoALPHA.png";

function Logo() {
  return (
    <Link to="/">
      <Image w="10rem" src={logo}></Image>
    </Link>
  );
}

export { Logo };
