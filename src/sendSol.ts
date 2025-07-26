import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

async function Main(): Promise<void> {
  try {
    // all networks
    const devnet = "https://api.devnet.solana.com";
    const testnet = "https://api.testnet.solana.com";
    const mainnetBeta = "https://api.mainnet-beta.solana.com";
    const alchemyURl =
      "https://solana-mainnet.g.alchemy.com/v2/YG-L0kqAF9TFItrbHFGqJ";

    // create a connection to the node
    const connection = new Connection(devnet);

    // create a sender keypair -> the person who will send the solana to the receiver
    const sender = Keypair.generate();
    console.log("Sender public key: ", sender.publicKey.toString());

    // create a receiver keypair -> the person who will receive the solana or the wallet address
    const receiver = Keypair.generate();
    // --> if you want to send to a wallet address
    // const reciever = new PublicKey("BTLYEJGcjMjGDTjFrdq83xzPaRo6sJo7gmLv6NYdLXHz")
    console.log("Receiver public key: ", receiver.publicKey.toString());

    // airdropping some solana to the sender wallet
    const airdropSignature = await connection.requestAirdrop(
      sender.publicKey,
      2 * LAMPORTS_PER_SOL
    );

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      signature: airdropSignature,
      ...latestBlockHash,
    });
    console.log("Airdropped 2 SOL to sender wallet");

    // wait for airdrop to be completed
    await waitForAirdrop(connection, sender.publicKey, 2 * LAMPORTS_PER_SOL);

    // create a instruction to send solana to the receiver
    const instruction = SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: receiver.publicKey,
      lamports: 1 * LAMPORTS_PER_SOL, // 2 SOL
    });

    // Create a transaction
    const transaction = new Transaction().add(instruction);

    // sign the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      sender,
    ]);
    console.log("Transaction sent");

    console.log(
      "🔗 Explorer URL:",
      `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
  } catch (error) {
    console.log("Error during transfer: ", error);
  }
}

async function waitForAirdrop(
  connection: Connection,
  pubkey: PublicKey,
  expectedBalance: number
) {
  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    const balance = await connection.getBalance(pubkey);
    if (balance >= expectedBalance) return true;
    console.log(
      `Waiting for airdrop... Current balance: ${
        balance / LAMPORTS_PER_SOL
      } SOL`
    );
    await new Promise((res) => setTimeout(res, 1000)); // wait 1s
    retries++;
  }

  throw new Error("Airdrop not completed within expected time");
}

Main();
