import { useEffect, useRef, useState } from "react";

export function useAutoResizeInput(
  initialInputText = "",
  initialToggle = false,
) {
  const [inputText, setInputText] = useState(initialInputText);
  const [toggle, setToggle] = useState(initialToggle);
  const inputTextRef = useRef<HTMLTextAreaElement>(null);

  const autoResizeInput = () => {
    if (inputTextRef.current) {
      inputTextRef.current.style.height = "auto";
      inputTextRef.current.style.height = `${inputTextRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResizeInput();
  }, [inputText]);

  return { inputText, setInputText, toggle, setToggle, inputTextRef };
}
