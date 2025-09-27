"use client";

import Image from "next/image";
import Link from "next/link";
import { FaMailBulk, FaTelegramPlane, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { cn } from "@/utils";
import { routes } from "@/constants/routes";
import { appImage } from "@/public/images";

const Footer = function ({ className = "" }: { className?: string }) {
  return (
    <div className={cn(className, "px-auto pb-[50px] mt-[100px]")}>
      <div className="mx-auto my-0 w-full max-w-[1200px]">
        {/*  footer-begin */}
        <section className="mt-[100px] max-md:my-[50px] flex justify-between max-md:flex-col">
          <div className="flex w-[412px] flex-col">
            <Link className="relative flex items-center gap-[8px]" href={routes.landing.redirect}>
              <Image className="h-[35px] w-[35px] object-cover" src={appImage.logo} alt="Logo" />
              <span className="text-2xl">Traceability</span>
            </Link>

            <p className="mx-0 mb-[12px] mt-[35px] text-[15px] leading-[25px] text-gray-300 max-md:mt-[15px] max-md:mb-[20px] max-md:leading-[16px] max-md:text-[12px]">
              Supply Chain Traceability Generator: Simplifying Asset Management on Blockchain, Open-Source Transparency for Supply Chains, Simplify
              Blockchain-Based Supply Chain Tracking.
            </p>

            <p className={"text-[15px] leading-[22px] text-gray-500"}>nguyenkhanh17112003@gmail.com</p>
          </div>

          <div className="flex gap-[45px] max-md:gap-6 leading-[20px] mt-[50px]">
            <ul>
              <h2 className="mb-9 max-md:mb-4 text-[19px] font-bold text-white max-md:text-[12px]">Explore</h2>
              <li className="mt-[25px] max-md:mt-2">
                <Link className="cursor-pointer text-[15px] leading-[20px] text-gray-400 max-md:text-[12px]" href={routes.mint.redirect}>
                  Asset Minting
                </Link>
              </li>
              <li className="mt-[25px] max-md:mt-2">
                <Link
                  className="cursor-pointer text-[15px] leading-[20px] text-gray-400 max-md:text-[12px]"
                  href={routes.utilities.children.collection.redirect}
                >
                  Metadata
                </Link>
              </li>
              <li className="mt-[25px] max-md:mt-2">
                <Link
                  className="cursor-pointer text-[15px] leading-[20px] text-gray-400 max-md:text-[12px]"
                  href={routes.utilities.children.fastCollection.redirect}
                >
                  Fast Collection
                </Link>
              </li>
              <li className="mt-[25px] max-md:mt-2">
                <Link
                  className="cursor-pointer text-[15px] leading-[20px] text-gray-400 max-md:text-[12px]"
                  href={routes.utilities.children.storage.redirect}
                >
                  Storage
                </Link>
              </li>
            </ul>

            <ul>
              <h2 className="mb-9 max-md:mb-4 text-[19px] font-bold text-white max-md:text-[12px]">Resources</h2>
              <li className="mt-[25px] max-md:mt-2">
                <Link
                  className="cursor-pointer text-[15px] leading-[20px] text-gray-400 max-md:text-[12px]"
                  href={routes.login.redirect}
                  target="_blank"
                >
                  Documentation
                </Link>
              </li>
              <li className={"mt-[25px] max-md:mt-2"}>
                <Link
                  className="cursor-pointer text-[15px] leading-[20px] text-gray-400 max-md:text-[12px]"
                  target="_blank"
                  href={"https://cardano2vn.io"}
                >
                  Blog
                </Link>
              </li>
              <li className={"mt-[25px] max-md:mt-2"}>
                <Link
                  className="cursor-pointer text-[15px] leading-[20px] text-gray-400 max-md:text-[12px]"
                  href={routes.login.redirect}
                  target="_blank"
                >
                  User guide
                </Link>
              </li>
            </ul>

            <ul>
              <h2 className="mb-9 max-md:mb-4 text-[19px] font-bold text-whit  max-md:text-[12px]">Developers</h2>
              <li className="mt-[25px] max-md:mt-2">
                <Link
                  className="cursor-pointer text-[15px] leading-[20px] text-gray-400 max-md:text-[12px]"
                  target="_blank"
                  href={"https://traceability.trustorstudio.com/"}
                >
                  Bug Bounty
                </Link>
              </li>
              <li className={"mt-[25px] max-md:mt-2"}>
                <Link
                  className="cursor-pointer text-[15px] leading-[20px] text-gray-400 max-md:text-[12px]"
                  target="_blank"
                  href={"https://traceability.trustorstudio.com/"}
                >
                  User Feedback
                </Link>
              </li>
            </ul>

            <ul>
              <h2 className="mb-9 max-md:mb-4 text-[19px] font-bold text-white max-md:text-[12px]">Supports</h2>

              <li className={"mt-[25px] max-md:mt-2"}>
                <Link
                  className="cursor-pointer text-[15px] leading-[20px] text-gray-400 max-md:text-[12px]"
                  target="_blank"
                  href={"https://traceability.trustorstudio.com/"}
                >
                  Contact Us
                </Link>
              </li>
              <li className={"mt-[25px] max-md:mt-2"}>
                <Link
                  className="cursor-pointer text-[15px] leading-[20px] text-gray-400 max-md:text-[12px]"
                  target="_blank"
                  href={"https://traceability.trustorstudio.com/"}
                >
                  FAQS
                </Link>
              </li>
            </ul>
          </div>
        </section>
        {/*  footer-end */}

        {/* bottom-begin */}
        <footer className="border-[rgb(238, 238, 238)] mt-10 flex items-center justify-between border-t-[1px] border-solid pt-8 max-md:mt-[20px] max-md:pt-[15px] max-md:overflow-hidden">
          <ul className="flex items-center">
            <strong className="mr-10 text-[16px] text-[rgb(153,153,153)] max-md:mr-[20px] max-md:text-[12px]">Community</strong>

            <div className="flex items-center gap-8 max-md:gap-1">
              <Link
                className="flex items-center justify-center rounded-full border-[1px] border-solid border-slate-500 p-[8px] max-md:p-2 max-md:border-none"
                target="_blank"
                href={"https://traceability.trustorstudio.com/"}
              >
                <FaTelegramPlane className="text-[19px] max-md:text-[16px]" />
              </Link>
              <Link
                className="flex items-center justify-center rounded-full border-[1px] border-solid border-slate-500 p-[8px] max-md:p-2 max-md:border-none"
                target="_blank"
                href={"https://traceability.trustorstudio.com/"}
              >
                <FaMailBulk className="text-[19px] max-md:text-[16px]" />
              </Link>
              <Link
                className="flex items-center justify-center rounded-full border-[1px] border-solid border-slate-500 p-[8px] max-md:p-2 max-md:border-none"
                target="_blank"
                href={"https://traceability.trustorstudio.com/"}
              >
                <FaYoutube className="text-[19px] max-md:text-[16px]" />
              </Link>
              <Link
                className="flex items-center justify-center rounded-full border-[1px] border-solid border-slate-500 p-[8px] max-md:p-2 max-md:border-none"
                target="_blank"
                href={"https://traceability.trustorstudio.com/"}
              >
                <FaXTwitter className="text-[19px] max-md:text-[16px]" />
              </Link>
            </div>
          </ul>
          <div className="text-[15px] text-[rgb(153,153,153)] max-md:text-[12px] max-md:whitespace-normal max-md:scale-[0.8] text-end">
            © 2025 Design & Develop By Independence, Version {"1.0.1"}
          </div>
        </footer>
        {/* bottom-end */}
      </div>
    </div>
  );
};

export default Footer;
