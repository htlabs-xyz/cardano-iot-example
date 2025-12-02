**List of Implemented IoT Projects**

1. Sensor Monitoring Project – Ensuring authenticity of sensor data with blockchain.
2. Smart Locker Control – Secure access management using blockchain.
3. Secure Payment Systems – Enabling safe transactions for IoT devices.
4. Blockchain for Identity Verification – Preventing fraud through decentralized identity management.
5. Supply Chain Monitoring Project – Enhancing traceability and accountability in supply chains.

---

## **1. Sensor Monitoring Project**

**Target**

Utilizing blockchain to securely record IoT sensor data, preventing tampering and ensuring data authenticity.

Example: In an industrial setting, multiple sensors monitor machine performance. Using blockchain, sensor readings are recorded in an immutable ledger, preventing data manipulation that could lead to false maintenance alerts.

**Requirements**

The system requires multiple components to function efficiently, including hardware devices, network connectivity, blockchain integration, software tools, and security measures.

1. Hardware Components

To collect environmental data, the system utilizes temperature and humidity sensors, such as the DHT21 or MQ135, which are capable of providing precise readings. These sensors are connected to an IoT device, which could be a microcontroller like the ESP32 or a single-board computer like the Raspberry Pi. This device is responsible for gathering and transmitting the sensor data. To ensure continuous operation, a stable power supply, either in the form of a rechargeable battery or an uninterrupted power source, is necessary.

2. Network and Connectivity

The IoT device must have a reliable connection to the internet via Wi-Fi or a 4G cellular network. This ensures seamless communication between the IoT device and the blockchain. To interact with the Cardano blockchain, an API such as Blockfrost, Koios, or a direct connection to a Cardano full node is required for submitting transactions and retrieving stored data.

3. Blockchain Components

A Plutus smart contract is deployed on the Cardano blockchain to authenticate and verify the sensor data. The data collected from the sensors is structured into a Datum using CBOR format, ensuring compatibility with smart contract processing. Transactions involving data verification and storage require a Cardano wallet, such as Nami or Yoroi, to sign and approve submissions.

4. Software and Firmware

The IoT device operates on custom firmware that continuously collects sensor data, formats it into a structured Datum, and transmits it to the blockchain. To facilitate blockchain interactions, SDKs such as cardano-serialization-lib, meshsdk, or lucid are used for processing transactions. Optionally, a user interface, such as a web dashboard or a mobile application, may be developed to display real-time sensor data in an accessible manner.

5. Security Measures

To protect data integrity and prevent unauthorized access, encryption using SSL/TLS is applied to secure data transmissions from the IoT device to the blockchain. The system also ensures secure storage and usage of private keys, which are needed to sign transactions. Additionally, the Plutus smart contract is optimized to prevent logic vulnerabilities and ensure secure processing of sensor data.

**Functions**

The system provides essential functionalities to efficiently collect, process, store, and validate data on the blockchain while triggering appropriate actions based on the recorded readings.

1. Data Collection and Formatting

The IoT device continuously monitors environmental conditions, capturing temperature and humidity readings. These values are structured into a formatted Datum that includes the recorded parameters and an initial system state. The structured data is formatted as follows:

```ak
pub type Datum { owner: VerificationKeyHash, value: Int }
```

2. Data Transmission to Blockchain

Once the data is collected and formatted, the IoT device transmits it to the Cardano blockchain via API services such as Blockfrost. The blockchain records this information in an immutable ledger, ensuring that the data remains tamper-proof and verifiable.

3. Blockchain-based Data Validation

When the data reaches the blockchain, a Plutus smart contract validates its authenticity and determines the system state based on predefined thresholds. The validation logic follows these conditions:

```ak
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{InlineDatum, OutputReference, Transaction, find_input}
use cardano/tx

pub type Datum {
  owner: VerificationKeyHash,
  value: Int,
}

pub type Redeemer {
  Update
  Withdraw
}

validator confirm_status {
  spend(
    datum_otp: Option<Datum>,
    redeemer: Redeemer,
    output_reference: OutputReference,
    transaction: Transaction,
  ) {
    expect Some(datum_input) = datum_otp
    let Transaction { inputs, extra_signatories, .. } = transaction
    expect Some(input) = find_input(inputs, output_reference)
    expect InlineDatum(datum_output_inline) = input.output.datum
    expect datum_output: Datum = datum_output_inline
    when tx.verify_signature(extra_signatories, datum_input.owner) is {
      True ->
        when redeemer is {
          Update -> True
          Withdraw -> datum_output.value >= datum_input.value
        }

      False -> False
    }
  }

  else(_) {
    fail
  }
}
```

4. Data Storage and Retrieval

All validated sensor data and system states are stored on the blockchain, either in metadata or UTXOs. Users can retrieve historical sensor readings and analyze environmental trends using APIs like Koios or Blockfrost. This allows stakeholders to assess conditions over time, detect anomalies, and make data-driven decisions based on real-time and past data.

---

## **2. Smart Locker Control**

**Target**

Blockchain manages smart lockers, ensuring only authorized individuals can access them, reducing theft risks.  
_Example_: Office lockers controlled by a mobile app use blockchain to log each access, creating a secure and transparent access history.

**Requirements**

1. Hardware Components

The smart lock system includes an electronic lock (solenoid lock or servo motor) that can be controlled via electronic signals. It is powered by an IoT microcontroller, such as ESP32 or Raspberry Pi, which enables Wi-Fi connectivity and blockchain interaction.

For additional security, optional sensors like a reed switch can detect whether the lock is open or closed, while a vibration sensor can identify unauthorized access attempts. The system operates on a rechargeable battery (LiPo 3.7V) or fixed power (5V/12V) with a backup supply to ensure continuous functionality. An OLED display (optional) can provide real-time status updates such as "Locked," "Unlocked," or "Waiting for Authentication."

2. Connectivity

A stable internet connection via Wi-Fi or a 4G module is required for the IoT device to communicate with the Cardano blockchain. In areas with poor connectivity, LoRaWAN can serve as an alternative. For efficient data transmission, lightweight communication protocols like MQTT or WebSocket will be used to connect the IoT device with Cardano APIs such as Blockfrost or Koios.

3. Blockchain Integration

A stable internet connection via Wi-Fi or a 4G module is required for the IoT device to communicate with the Cardano blockchain. In areas with poor connectivity, LoRaWAN can serve as an alternative. For efficient data transmission, lightweight communication protocols like MQTT or WebSocket will be used to connect the IoT device with Cardano APIs such as Blockfrost or Koios.

4. Software Components

The IoT firmware, written in MicroPython or C++, fetches blockchain data, controls the lock mechanism, and reports status updates. A management application (web or mobile, built with React) enables the owner to grant or revoke access, view access history, and monitor the real-time status of the lock. Cardano tools like Cardano CLI, cardano-serialization-lib, and Blockfrost API facilitate blockchain interactions. Additionally, a dashboard system displays real-time updates on lock status, authorized users, and alerts for suspicious activities.

5. Security

All data transmissions between the IoT device and the blockchain are encrypted using SSL/TLS to prevent interception. Access transactions are authenticated using private keys, ensuring only the owner or authorized wallets can unlock the system. To protect the Plutus smart contract, measures are taken against double-spending and reentrancy attacks. In case of suspicious activity, such as forced entry, the system logs events on the blockchain and sends instant alerts. This architecture ensures a secure, decentralized, and tamper-proof smart lock system leveraging the Cardano blockchain for transparent and remote access control.

**Functions**

The system provides essential functionalities to efficiently collect, process, store, and validate data on the blockchain while triggering appropriate actions based on the recorded readings.

1. Data Organization and Formatting

The IoT device continuously tracks the keys. These values ​​are structured into a formatted Datum consisting of parameters and Structured Data formatted as follows:

```ak
pub type Datum {
  owner: VerificationKeyHash,
  authority: VerificationKeyHash,
  is_locked: Int,
}
```

2. Data Transmission to Blockchain

Once the data is collected and formatted, the IoT device transmits it to the Cardano blockchain via API services such as Blockfrost. The blockchain records this information in an immutable ledger, ensuring that the data remains tamper-proof and verifiable.

3. Blockchain-based Data Validation

Once the data reaches the blockchain, the Plutus smart contract validates the authenticity of the data and determines the system state. The validation logic is subject to the following conditions:

```ak
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/assets.{flatten, without_lovelace}
use cardano/transaction.{
  InlineDatum, Output, OutputReference, Transaction, find_input,
}
use cardano/tx
use validation/find.{output_by_addr_value}

pub type Datum {
  owner: VerificationKeyHash,  // Owner of the system
  authority: VerificationKeyHash,  // Authority allowed to authorize actions
  is_locked: Int,  // Lock status (1 = locked, 0 = unlocked)
}

pub type Redeemer {
  Status  // Action to check status and potentially unlock or lock the system
  Authorize  // Action to authorize a new owner
}

validator status_management {
  spend(
    datum_opt: Option<Datum>,  // Optional Datum for the transaction
    redeemer: Redeemer,  // Redeemer for the transaction action
    output_reference: OutputReference,  // Reference to the output of the transaction
    transaction: Transaction,  // The entire transaction data
  ) {
    expect Some(datum_input) = datum_opt  // Ensure there is a datum input
    let Transaction { inputs, outputs, extra_signatories, .. } = transaction
    expect Some(input) = find_input(inputs, output_reference)
    let script_address = input.output.address  // Get the address of the script
    let token =
      input.output.value
        |> without_lovelace()  // Extract the token value (without ADA)

    expect InlineDatum(datum_output_inline) = input.output.datum  // Inline datum from the output
    expect datum_output: Datum = datum_output_inline  // The Datum for the output
    let owner_sign = tx.verify_signature(extra_signatories, datum_input.owner)  // Verify owner's signature
    let authority_sign = tx.verify_signature(extra_signatories, datum_input.authority)  // Verify authority's signature
    let change_owner = datum_input.owner == datum_output.owner  // Check if the owner is unchanged
    let change_authority = datum_input.authority == datum_output.authority  // Check if the authority is unchanged
    let utxo_output = output_by_addr_value(outputs, script_address, token)  // Get the output of the transaction based on token and address
    
    // Conditions based on the redeemer action (Status or Authorize)
    when redeemer is {
      Status ->  // Handle system status (unlock or lock)
        when datum_input.is_locked == 0 is {
          True -> and {
              check_output_utxo(utxo_output, 1),  // Validate UTXO output with a lock status of 1
              or {
                owner_sign,  // Either owner or authority must sign the transaction
                authority_sign,
              },
              change_owner,  // Ensure owner remains unchanged
              change_authority,  // Ensure authority remains unchanged
              datum_output.is_locked == datum_input.is_locked,  // Ensure locked status remains unchanged
            }
          False -> and {
              check_output_utxo(utxo_output, 0),  // Validate UTXO output with a lock status of 0
              or {
                owner_sign,  // Either owner or authority must sign the transaction
                authority_sign,
              },
              change_owner,  // Ensure owner remains unchanged
              change_authority,  // Ensure authority remains unchanged
              datum_output.is_locked == datum_input.is_locked,  // Ensure locked status remains unchanged
            }
        }
      Authorize -> and {
          owner_sign,  // Only the owner must sign the transaction
          change_owner,  // Ensure owner is changed if authorization occurs
        }
    }
  }

  else(_) {
    fail  // Fail the transaction if conditions are not met
  }
}

// check the output utxos containing the token
pub fn check_output_utxo(output: Output, is_lock: Int) -> Bool {
  expect InlineDatum(data) = output.datum  // Extract datum from the output
  expect datum: Datum = data  // Convert datum to Datum type
  let output_value =
    output.value
      |> without_lovelace()  // Extract token value (without ADA)
      |> flatten()  // Flatten the token value into a list
  
  and {
    datum.is_locked == is_lock,  // Check if lock status matches
    list.length(output_value) == 1,  // Ensure there is only one token
  }
}

```

4. Data Storage and Retrieval

All authenticated data and system state are stored on the blockchain, in metadata or UTXOs. Users can retrieve historical metrics and analyze trends using APIs like Koios or Blockfrost.

## **3. Secure Payment Systems**

**Target**

Blockchain facilitates secure, immutable transactions between IoT devices.  
_Example_: In automated shopping systems (e.g., vending machines), blockchain processes payments instantly and securely, protecting transaction data.

**Requirements**

1. Hardware Components

- Raspberry Pi (or ESP32): The main platform to control and connect IoT devices. Raspberry Pi 5 or ESP32 would be ideal because they provide high performance, Wi-Fi/Bluetooth connectivity, and support for various sensors and peripherals.
- 7-inch Raspberry Pi Touchscreen: This will display the user interface (UI) for actions like payments, product selection, and user interactions.
- Sensors/Peripheral Inputs: Sensors like weight sensors, RFID (if applicable), or product recognition sensors will help identify selections and trigger payments.
- Servo or Mechanical Devices: To control mechanisms like opening/closing doors in vending machines after transactions.
- Connectivity Ports: GPIO and DSI for connecting external devices to the Raspberry Pi.

2. Network and Connectivity

- Internet Connection: Wi-Fi or Ethernet (4G/5G may be used if the system requires mobility or operates in areas without fixed internet).
- Blockchain Network: Cardano will be used as the blockchain to process transactions. Raspberry Pi will need to connect to a Cardano node to perform transactions, transfer funds, and confirm payments.
- Cardano API/SDK: You'll need to integrate Cardano’s API into your software to interact with the blockchain.

3. Blockchain Components

- Cardano Blockchain: Use Cardano for quick, secure, and immutable payment processing. Cardano will ensure transaction integrity and validation for purchases.
- Smart Contracts (Plutus): Smart contracts on Cardano can automate payment processes when a customer uses the vending machine. Plutus, Cardano’s smart contract language, will be used to write contracts that manage payments.
- Wallets: You'll need Cardano wallets integrated into the system to facilitate transactions in ADA or Cardano-based tokens.
- Cardano Node: Raspberry Pi or other devices in your system can run a lightweight Cardano node to interact with the network and send/receive transactions.

4. Software and Firmware

- IoT Firmware: Write firmware for the Raspberry Pi or ESP32 to control sensors, touchscreens, servos, and communicate with the blockchain via API.
- Cardano API/SDK: Use Cardano’s APIs/SDKs (e.g., cardano-wallet or cardano-serialization-lib) to handle wallet management and transaction processing.
- Web Interface: Build a web or mobile interface for users to select products and make payments. This interface will communicate with the blockchain system via an intermediary service.

5. Security Measures

- Transaction Encryption: Use strong encryption to protect user data and ensure transactions are secure and immutable.
- Two-Factor Authentication (2FA): For added security, implement 2FA for wallet and transaction access to prevent unauthorized use.
- Cardano’s Proof of Stake: Cardano’s PoS protocol ensures transaction security and blockchain integrity, protecting data and transactions from tampering.
- Monitoring and Reporting: Implement monitoring features to track transactions and detect suspicious or fraudulent activities.
- Software Updates: Continuously update firmware, software, and security measures to address vulnerabilities and ensure the system is secure.

**Functions**

1. Data Collection and Formatting

In this step, IoT devices such as vending machines, sensors, or smart meters collect relevant data. This data can include product selections, payment requests, machine status (e.g., stock levels, temperature, or errors), and customer interactions.

To ensure consistency, the collected data is formatted into a structured format, typically using JSON. This helps in transmitting information efficiently to the blockchain. An example of a formatted dataset could look like this:

```json
{
  "device_id": "001",
  "timestamp": "2025-04-01T12:34:56Z",
  "transaction": {
    "item_id": "Milk001",
    "price": 1.50,
    "payment_method": "ADA",
    "status": "pending"
  }
}
```

This ensures that all data is structured correctly before being sent to the blockchain for validation and processing.

2. Data Transmission to Blockchain

- Once the data is collected and formatted, it needs to be securely transmitted to the Cardano blockchain. This is done using IoT gateways such as Raspberry Pi, ESP32, or similar embedded systems.
- The transmission can be handled via different communication protocols, including MQTT, HTTP APIs, or WebSockets. These enable IoT devices to send transaction requests to a blockchain-based middleware or smart contract.
- For example, in an automated vending machine: The vending machine detects a payment request. It sends the transaction details to the blockchain through an API. The smart contract verifies the transaction and records it.
- By utilizing blockchain for data transmission, we ensure that the data is securely logged and remains tamper-proof.

3. Blockchain-based Data Validation

- Once the transaction is received by the blockchain, smart contracts running on Cardano will validate the data before approving the transaction.
- The validation process checks for: A valid ADA payment from the user. Sufficient stock availability in the vending machine. No duplicate or fraudulent transactions.
- If all conditions are met, the smart contract updates the blockchain ledger and triggers the IoT device (e.g., a vending machine) to release the product.

4. Data Storage and Retrieval

After successful validation, the transaction is stored securely on the blockchain. The storage process consists of: 
- On-chain storage: Immutable records of transactions, ensuring transparency and security.
- Off-chain storage: Additional logs for machine status, customer analytics, and maintenance records.

Users can retrieve transaction details by querying the blockchain. For example, a customer could scan a QR code on the vending machine to check the transaction history.

## **4. Blockchain for Identity Verification**

**Target**

Blockchain can authenticate user identities in IoT systems, preventing fraud by assigning each user a unique ID stored on the blockchain.

_Example_: Decentralized Identity for Academic Credentials using Cardano and IoT

1. Students Own Their Decentralized Identity (DID) and Academic Credentials

Each student will have a decentralized identity (DID) stored on the Cardano blockchain. Their academic credentials, such as diplomas or certificates, will be issued as verifiable credentials (VCs), ensuring authenticity and security.

2. Universities Issue Certifications to Students

Universities will act as trusted issuers, creating and signing digital certificates using Atala PRISM. These credentials will be linked to the student's DID and recorded on the blockchain for permanent, tamper-proof verification.

3. Employers Verify Student Credentials

Employers and institutional partners can use the verification platform to confirm the authenticity of a student's certificate. By scanning an NFC tag or QR code from the student’s mobile wallet, they can verify the credential's legitimacy via the Cardano blockchain.

4. Blockchain Stores and Verifies Credentials

The Cardano blockchain will store credential hashes instead of raw data to ensure privacy. The system will leverage Plutus smart contracts to automate identity validation and ensure that only authorized parties can verify credentials.

5. Mobile Identity Wallet for Students

A mobile application will serve as a self-sovereign identity (SSI) wallet, allowing students to manage their credentials, present them when needed, and control who can access their data. The app will use secure cryptographic keys to sign transactions

**Requirements**

1. Hardware Components

The project requires essential IoT and computing hardware for decentralized identity (DID) verification. A Raspberry Pi 5 will act as the main processing unit, running blockchain-related services and handling identity verification requests. To enable user interaction, a 7-inch Raspberry Pi Touch Display 2 will provide a touchscreen interface. For IoT integration, an ESP32 microcontroller will manage wireless communications and interact with verification devices. A PN532 NFC module will allow students to scan NFC-enabled ID cards for authentication, ensuring seamless identity verification.

2. Network and Connectivity

The system will rely on Wi-Fi 5 and Bluetooth 5.0 for wireless communication between IoT devices and the identity verification system. A Gigabit Ethernet connection will provide a stable network link for the Raspberry Pi running a Cardano node. IoT components such as the ESP32 and NFC module will communicate using I2C, SPI, and UART protocols. Additionally, an Internet Gateway will ensure secure blockchain interactions and data synchronization between the mobile identity wallet and the verification infrastructure.

3. Blockchain Components

The project will leverage the Cardano blockchain as a secure, decentralized platform for identity verification. Atala PRISM, Cardano’s decentralized identity solution, will issue and verify student credentials. Smart contracts written in Plutus will be used to store, manage, and validate digital identity records. NFT-based credentials will be issued to students as immutable digital certificates, ensuring authenticity and tamper resistance.

4. Software and Firmware

The Raspberry Pi will run Raspberry Pi OS (Bookworm) to host the verification dashboard and interact with blockchain services. The ESP32 firmware, developed using ESP-IDF or Arduino IDE, will manage NFC scanning and device communications. On the blockchain side, a Cardano Node and compatible wallets (Yoroi/Nami) will facilitate identity management. The Atala PRISM SDK will provide APIs for decentralized identity operations, while a Mobile Identity Wallet App will enable students to manage their digital credentials securely. Universities and employers will access a Web Dashboard to verify student certifications.

5. Security Measures

The system will implement strong security protocols to protect digital identities. Decentralized Identity (DID) ensures students retain control over their credentials without relying on centralized authorities. Zero-Knowledge Proofs (ZKP) will allow identity verification without exposing unnecessary personal data. Secure NFC authentication using AES encryption will prevent unauthorized access. Multi-factor authentication (MFA), combining NFC scanning and mobile app verification, will enhance security. End-to-end encryption (E2EE) will safeguard data transmissions between IoT devices, the blockchain, and mobile applications. Additionally, a Hardware Security Module (HSM) will be used for secure key storage, preventing credential theft or tampering.

**Functions**

1. Data Collection Function

The Data Collection function is responsible for collecting the necessary student credentials from the university's database or IoT devices and formatting them into a Verifiable Credential (VC). This function starts by fetching the student's details, such as their ID, degree program, and any other relevant academic achievements. The data is then structured into a standard Verifiable Credential format, which includes essential information such as the issuer (the university), the credential subject (the student), the type of credential (degree), the issuance date, and a digital signature. This structured data ensures that the credentials are easily verifiable and tamper-proof. The function then returns the completed Verifiable Credential, ready for transmission to the blockchain.

2. Data Transmission Function

Once the data has been collected and formatted, the Data Transmission function ensures that the student’s credential is securely sent to the blockchain for storage. This function begins by hashing the credential data to preserve privacy while still ensuring its integrity. The credential's hash is then associated with a Decentralized Identifier (DID), which uniquely identifies the student within the system. The DID is crucial for ensuring that the student’s credentials are linked to them without exposing personal information. The function then transmits the hashed credential and DID to the Cardano blockchain, ensuring that the data is securely stored and can be later verified by authorized parties.

3. Blockchain-based Data Validation

The Blockchain-based Data Validation function plays a critical role in ensuring the authenticity of the student's credentials. After the credential is transmitted to the blockchain, this function allows any third party, such as an employer or academic institution, to query the blockchain for the student’s credentials. The validation process involves checking the integrity of the credential’s hash stored on the blockchain and verifying the associated DID to confirm the legitimacy of the document. This decentralized approach ensures that the data cannot be tampered with or altered by any central authority, offering a robust and trustworthy system for credential verification.

4. Data Storage and Retrieval

The Data Storage and Retrieval function allows for the secure storage of the credentials on the blockchain and provides the ability to retrieve them when necessary. Credentials are stored as immutable data on the blockchain, with each credential's hash linked to the student's DID. The retrieval process involves querying the blockchain with the student's DID or other relevant identifiers to access the stored credential. By using blockchain’s decentralized nature, the system ensures that the data remains accessible, tamper-proof, and verifiable at any time, regardless of location or central control.

---

## **5. Supply Chain Monitoring Project**

**Target**

Blockchain can authenticate user identities in IoT systems, preventing fraud by assigning each user a unique ID stored on the blockchain.  
_Example_: In an automated car rental system, users verify their identity through blockchain, which securely stores personal data and transaction history.

**Requirements**
1. Hardware Components

The hardware components essential for the IoT supply chain management system include devices like the Raspberry Pi 5, which serves as the main computing unit, capable of handling data analysis, device control, and sensor data collection. With up to 16GB of RAM and a 64-bit quad-core Cortex-A76 processor, it can efficiently manage tasks in real-time. For smaller IoT projects, the ESP32 microcontroller is highly suitable due to its integrated Wi-Fi and Bluetooth capabilities, low energy consumption, and multiple I/O options. The GM65 Barcode/QR Code Scanner is necessary for scanning barcodes or QR codes, which can be used to track and authenticate goods within the supply chain, ensuring efficient and reliable identification. Lastly, the 7 Inch Raspberry Pi Touch Display 2 is used to display real-time data from the IoT system. Its capacitive touchscreen and 720x1280 resolution provide an interactive user interface for monitoring the supply chain's status.

2. Network and Connectivity

The IoT supply chain system requires reliable network connectivity to ensure seamless data exchange between devices and the central blockchain system. Wi-Fi is essential for wireless communication between IoT devices like Raspberry Pi and ESP32 modules. The dual-band 802.11ac Wi-Fi will provide stable high-speed connections, ensuring uninterrupted data transfer. Additionally, Bluetooth 5.0 can be employed for short-range communication, allowing devices to interact with each other or mobile apps in close proximity. For applications that require a more stable, high-speed connection, such as the Raspberry Pi 5, Ethernet connectivity is crucial. The Gigabit Ethernet ports provide fast data transfers, which are important for industrial IoT applications where large data volumes are handled.

3. Blockchain Components

To ensure transparency, traceability, and security in the supply chain, integrating Cardano Blockchain components is essential. Cardano's blockchain can store and manage all transactions related to the supply chain, such as shipment statuses and product authentication, with a high level of security and immutability. Smart contracts on the Cardano platform will play a significant role in automating supply chain processes, such as verifying order statuses, processing payments, and recording inventory movements. These contracts will help reduce human error, eliminate intermediaries, and speed up the process. Additionally, tokenization of goods on the blockchain will allow each item to be represented digitally, making it easier to track the origin, movement, and condition of goods as they pass through the supply chain.

4. Software and Firmware

The success of the IoT supply chain system also depends on the software and firmware controlling the devices and managing the data. The firmware on devices such as the Raspberry Pi and ESP32 will handle various tasks such as collecting sensor data, controlling devices, and managing communication with the central system. Regular updates will be required to maintain the stability and security of these devices. An IoT platform software like Node-RED or Thinger.io can be used to collect and analyze data from the IoT devices, providing a user-friendly interface for monitoring the system. Additionally, blockchain integration software is required to ensure seamless communication between the IoT network and the Cardano blockchain. APIs or SDKs designed for Cardano integration will enable the secure recording of transactions and interactions between devices on the blockchain.

5. Security Measures

In an IoT-based supply chain system, ensuring the security of data and devices is paramount. Encryption must be implemented for both data storage and transmission. AES-256 encryption will be used for storing sensitive data on devices and the blockchain, while TLS/SSL protocols will secure communication channels between IoT devices and the blockchain system. Authentication measures such as two-factor authentication (2FA) and SSL certificates will ensure that only authorized devices and users can access the system, preventing unauthorized access or tampering. Blockchain transactions will also be protected by smart contract audits to minimize vulnerabilities and ensure secure, immutable record-keeping. Finally, device security is vital to protect IoT devices from both physical and remote threats. Hardware security modules (HSM) such as the Trusted Platform Module (TPM) and secure boot processes will safeguard against unauthorized access and tampering with the IoT devices.

**Functions**

1. Data Collection and Formatting

- The first function in the IoT supply chain management system involves data collection and formatting. IoT devices, such as the Raspberry Pi 5, ESP32, and barcode scanners, continuously gather data from sensors, RFID tags, and QR code scans. The collected data could include information such as product ID, timestamp, temperature, humidity, location, and status of the product. This data is typically in raw format, which needs to be processed and structured for further usage. The system will include software to format the collected data into a standardized format, such as JSON or XML, making it compatible for transmission to the blockchain.

- As part of this step, CIP-68 can be leveraged to manage metadata related to the products. By using CIP-68 to handle metadata updates and management, we ensure that the product details (like packaging, batch numbers, expiration dates, etc.) can be updated in a flexible and efficient manner. This is crucial for IoT-driven supply chains, where product metadata may change during its journey, like in transit or after inspection.

2. Data Transmission to Blockchain

- Once the data is collected and formatted, the next crucial function is the data transmission to blockchain. In this step, the formatted data is transmitted to the Cardano blockchain using CIP-68 for metadata management. The transmission process involves using smart contracts to record the data onto the blockchain.

- CIP-68 allows for seamless updates of the product’s metadata without needing to rewrite or replace the original transaction data, making it ideal for tracking supply chain events. For example, a product’s status or inspection results can be updated as it moves through various stages of the supply chain, and these updates can be tracked and validated efficiently. This ensures that all changes are captured as new metadata, preserving the integrity and traceability of the supply chain data.

- The IoT system will interface with the blockchain using APIs or SDKs specific to the Cardano platform. These APIs facilitate the creation of transactions that store the formatted data in the blockchain ledger. Secure transmission protocols like TLS/SSL will be used to ensure that data is securely sent over the network, preventing interception or tampering during transit. This function ensures that once data is entered into the blockchain, it becomes a permanent, auditable record.

3. Blockchain-based Data Validation

- After the data is transmitted to the blockchain, the next function is blockchain-based data validation. This step leverages the inherent capabilities of the Cardano blockchain to ensure that the data is legitimate and complies with predefined conditions. Smart contracts play a critical role in validating the data, verifying conditions such as product authenticity, location verification, and whether certain supply chain milestones have been met (e.g., shipment confirmation, quality checks).

- CIP-68 helps in validating metadata updates by ensuring that the product’s lifecycle information is captured, stored, and validated correctly. For example, each time a shipment reaches a new milestone, such as passing a quality control check or arriving at a warehouse, the metadata can be updated, and the Cardano blockchain will validate and record this new piece of information. Since CIP-68 ensures efficient metadata management, these updates are processed without issues and are part of a seamless supply chain experience.

- This validation helps to build trust in the supply chain by providing transparent and verifiable information about each product's journey from manufacturer to end customer.

4. Data Storage and Retrieval

- The final function involves data storage and retrieval, where the validated data is securely stored on the Cardano blockchain using CIP-68 to manage product metadata. Each transaction recorded on the blockchain contains information such as product details, timestamps, and location data, making it easily accessible for future retrieval. Blockchain's decentralized nature ensures that the data is distributed across multiple nodes, providing redundancy and security.

- With CIP-68, the system also allows for continuous updates to the metadata, ensuring that any changes to product information (such as packaging updates or inspection results) are efficiently handled and stored. This makes the Cardano blockchain an ideal platform for real-time product tracking and dynamic data updates.

- When authorized users, such as supply chain managers, customers, or regulatory bodies, need to retrieve the data, they can access it via blockchain explorers or specialized interfaces designed for the IoT supply chain system. The retrieval process is fast and secure, allowing real-time access to data on product status, inventory levels, or shipment history. This ensures that stakeholders can always access the most up-to-date, tamper-proof information to monitor the supply chain efficiently and effectively.