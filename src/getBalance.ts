import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

async function getBalance( user: PublicKey): Promise<number | undefined> {
  try {
    // Create a connection to the Solana devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    // Define the public key you want to check balance for
    const publicKey = new PublicKey(user);

    // Fetch balance in lamports
    const balance = await connection.getBalance(publicKey);

    console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL");

    return balance / LAMPORTS_PER_SOL;

  } catch (error) {
    console.error("Error while getting balance:", error);
  }
}

const myWallet = new PublicKey("BTLYEJGcjMjGDTjFrdq83xzPaRo6sJo7gmLv6NYdLXHz");

// Call the function
getBalance(myWallet);
