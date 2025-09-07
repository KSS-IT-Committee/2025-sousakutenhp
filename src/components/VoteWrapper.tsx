// src/components/VoteWrapper.jsx
import { CookiesProvider } from "react-cookie";
import VoteForm from "./vote_form";

export default function VoteWrapper() {
  return (
    <CookiesProvider>
      <VoteForm />
    </CookiesProvider>
  );
}
