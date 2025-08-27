import React from "react";
import { useParams } from "wouter";
import TruthResultView from "../truth/TruthResultView";

export default function TruthResultPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  return (
    <div className="container mx-auto px-4 py-6">
      <TruthResultView id={id} />
    </div>
  );
}