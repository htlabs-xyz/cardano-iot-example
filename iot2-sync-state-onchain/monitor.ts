import { stringToHex } from "@meshsdk/core";
import { monitor } from "./script/monitor";

// init()



// policyId from wallet-derived locker (iot2 init tx b77d733d... on 2026-05-22)
const unit = "14f654abdb464eda741251bf79cf2b5735b5df571a55008875de5676" + stringToHex("locker_537")

monitor(unit)