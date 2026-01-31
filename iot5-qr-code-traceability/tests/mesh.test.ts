import {mint, update, burn} from "@/contract/scripts"

describe("Mint, Burn, Update, Remove Assets (NFT/TOKEN) CIP68", function () {
    jest.setTimeout(600000000);
    test("Mint", async function () {
       await mint()
    });

    // test("Update", async function () {
    //    await update()
    // });

    // test("Burn", async function () {
    //    await burn()
    // });
});