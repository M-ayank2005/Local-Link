import GeminiAssistant from "@/components/GeminiAssistant";

export default function ResourcesLayout({ children }) {
  return (
    <>
      {children}
      <GeminiAssistant />
    </>
  );
}
