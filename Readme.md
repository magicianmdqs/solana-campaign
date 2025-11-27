# 🚀 Solana Campaign dApp
A full-stack Solana application built with **Anchor**, **TypeScript**, and a **Neon Cyberpunk React frontend** deployed on **Vercel**.

This project allows users to:

- Create fundraising campaigns
- View all campaigns on-chain
- Donate SOL to campaigns
- Withdraw SOL from campaigns
- Interact with the program using Phantom or any Solana wallet adapter

> 🔗 **Chain:** `Testnet`  
> 🔗 **Program ID:** `51yDLUXvtS8b3e9dsiDvgsQDRgyayCMqMnzY3JU6JDCF`  
> 🔗 **Live Frontend on Vercel:** https://solana-campaign-esu4.vercel.app

---

## ✨ Features

### 🟣 On-chain (Anchor Program)
- Create Campaign (name + description)
- Track admin, amount donated, and campaign metadata
- Accept SOL donations
- Allow campaign admin to withdraw funds
- Uses Anchor PDA for secure campaign accounts

### 🔵 Frontend (React + Vite + TypeScript)
- Phantom-style animated gradient UI
- Neon cyberpunk theme
- Solana wallet adapter integration
- Ability to create, view, donate, and withdraw
- Hosted on Vercel

---

## 📦 Tech Stack

### **On-chain**
- Solana
- Anchor Framework
- Rust
- PDAs

### **Frontend**
- React + Vite
- TypeScript
- Solana Wallet Adapter
- Phantom-style CSS theme (custom cyber UI)

### **Deployment**
- Vercel (frontend)
- Solana Devnet / Localnet (backend)

---

## 🛠️ Local Development

### 1️⃣ Install dependencies
```sh
npm install
