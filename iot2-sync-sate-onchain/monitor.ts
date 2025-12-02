import { stringToHex } from "@meshsdk/core";
import { monitor } from "./script/monitor";

// init()



const unit = "d83f77f0bfbc84c9e04289a89aa8382505a1cc99ad2dbfa122c7de64" + stringToHex("Locker001")

monitor(unit)