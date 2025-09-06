// src/components/VoteWrapper.jsx
import { CookiesProvider } from "react-cookie";
import VoteForm from "./vote_form";

export default function VoteWrapper({ sitekey }: { sitekey: string }) {
  return (
    <CookiesProvider>
      <VoteForm />
    </CookiesProvider>
  );
}
