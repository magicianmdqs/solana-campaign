import {useEffect, useState} from "react";
import idl from './my_program.json';
import {clusterApiUrl, Connection, PublicKey, SystemProgram} from "@solana/web3.js";
import {AnchorProvider, utils, Program, web3, BN} from "@coral-xyz/anchor";
import type {MyProgram} from "./my_program.ts";
import "./campaigns.css"

import {Buffer} from "buffer";

window.Buffer = Buffer;

const network = clusterApiUrl('testnet');
console.log("Connected to network: ", network)
// const network = "https://api.testnet.solana.com";
const opts = {
    preflightCommitment: "processed",
    skipPreflight: false,
};

const App = () => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [campaignName, setCampaignName] = useState("");
    const [campaignDesc, setCampaignDesc] = useState("");
    const [campaigns, setCampaigns] = useState([]);

    const getProvider = () => {
        // @ts-ignore
        const connection = new Connection(network, opts.preflightCommitment);
        // @ts-ignore
        return new AnchorProvider(connection, window.solana, opts.preflightCommitment);
    };

    const walletConnected = async () => {
        try {
            // @ts-ignore
            const {solana} = window;
            if (solana?.isPhantom) {
                const response = await solana.connect({onlyIfTrusted: true});
                setWalletAddress(response.publicKey.toString());
            }
        } catch (error) {
            console.log(error);
        }
    };

    const connectWallet = async () => {
        // @ts-ignore
        const {solana} = window;
        if (solana) {
            const response = await solana.connect();
            setWalletAddress(response.publicKey.toString());
            console.log("Connected with Public Key:", response.publicKey.toString());
        }
    };


    const createCampaign = async () => {
        try {
            const provider = getProvider();
            const program = new Program<MyProgram>(idl, provider);

            const [campaign] = await PublicKey.findProgramAddress([
                utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
                provider.wallet.publicKey.toBuffer()
            ], program.programId);

            console.log("Campaign address:", campaign.toString());

            await program.methods.create(campaignName, campaignDesc)
                .accounts({
                    // @ts-ignore
                    campaign,
                    systemProgram: SystemProgram.programId,
                    user: provider.wallet.publicKey
                })
                .rpc();

            console.log("Created a new campaign with address:", campaign.toString());
        } catch (error) {
            console.log(error);
        }
    };

    const getCampaigns = async () => {
        // @ts-ignore
        const connection = new Connection(network, opts.preflightCommitment);
        const provider = getProvider();
        const program = new Program<MyProgram>(idl, provider);
        Promise.all((await connection.getProgramAccounts(program.programId)).map(async campaign => ({
            ...(await program.account.campaign.fetch(campaign.pubkey)),
            pubkey: campaign.pubkey,
            // @ts-ignore
            balance: await connection.getBalance(campaign.pubkey),
        }))).then(campaigns => {
            // @ts-ignore
            setCampaigns(campaigns);
        });
    }


    // @ts-ignore
    const donate = async (publicKey) => {
        try {
            const provider = getProvider();
            const program = new Program<MyProgram>(idl, provider);

            await program.methods.donate(new BN(0.1 * web3.LAMPORTS_PER_SOL))
                .accounts({
                    campaign: publicKey,
                    user: provider.wallet.publicKey,
                    // @ts-ignore
                    systemProgram: SystemProgram.programId
                })
                .rpc();
            console.log("Donated to campaign with address:", publicKey.toString());
            await getCampaigns();
        } catch (error) {
            console.log("Donate error:", error);
        }
    }

    // @ts-ignore
    const withdraw = async (publicKey) => {
        try {
            const provider = getProvider();
            const program = new Program<MyProgram>(idl, provider);

            await program.methods.withdrawal()
                .accounts({
                    campaign: publicKey,
                    user: provider.wallet.publicKey,
                })
                .rpc();
            console.log("Withdrawn from campaign with address:", publicKey.toString());
        } catch (error) {
            console.log("Withdraw error:", error);
        }
    }


    const renderNotConnectedContainer = () => (
        <div className="wallet-slot">

            <button className="btn-orange connect-wallet-button"
                    onClick={connectWallet}>
                Connect to Wallet
            </button>
        </div>
    );

    const renderConnectedContainer = () => (
        <div className="campaign-container">
            <input
                type="text"
                className="input-field"
                placeholder="Campaign Name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
            />
            <input
                type="text"
                className="input-field"
                placeholder="Campaign Description"
                value={campaignDesc}
                onChange={(e) => setCampaignDesc(e.target.value)}
            />

            <button className="btn-orange" onClick={createCampaign}>
                Create Campaign
            </button>

            <br/>
            <br/>

            <button className="btn-orange" onClick={getCampaigns}>
                Get Campaigns
            </button>

            <br/>

            {campaigns.map(campaign => (
                <div className="campaign-card"
                    // @ts-ignore

                     key={campaign.pubkey.toString()}
                >
                    <p>Campaign Admin: {
                        // @ts-ignore

                        campaign.admin.toString()}</p>
                    <p>Campaign Pubkey: {
                        // @ts-ignore

                        campaign.pubkey.toString()}</p>
                    <p>Campaign Name: {
                        // @ts-ignore

                        campaign.name}</p>
                    <p>Campaign Description: {
                        // @ts-ignore

                        campaign.desc}</p>
                    <p>Total Donations: {
                        // @ts-ignore

                        campaign.amountDonated / web3.LAMPORTS_PER_SOL} SOL</p>

                    <p>Available to withdraw: {
                        // @ts-ignore
                        (campaign.balance / web3.LAMPORTS_PER_SOL)-(campaign.rentBal / web3.LAMPORTS_PER_SOL)} SOL
                    </p>

                    <button
                        // @ts-ignore
                        onClick={() => donate(campaign.pubkey)}
                        className="btn-orange"
                    >
                        Donate 0.1 SOL
                    </button>

                    <br/>

                    <button
                        // @ts-ignore
                        onClick={() => withdraw(campaign.pubkey)}
                        className="btn-orange danger"
                    >
                        Withdraw {
                            // @ts-ignore
                        (campaign.balance / web3.LAMPORTS_PER_SOL)-(campaign.rentBal / web3.LAMPORTS_PER_SOL)} SOL
                    </button>

                    <p className="divider"></p>
                </div>
            ))}
        </div>

    );


    useEffect(() => {
        const onLoad = async () => {
            await walletConnected();
        };
        window.addEventListener('load', onLoad);
        return () => window.removeEventListener('load', onLoad);
    }, []);

    return (
        <div className="App">

            <div className="container">
                <div className="header-container">
                    {!walletAddress ? renderNotConnectedContainer() : renderConnectedContainer()}
                </div>
            </div>
            <p>
                RPC: {network.toString()}
            </p>
        </div>
    )
        ;
};

export default App;
