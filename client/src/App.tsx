import React from "react";
import { Router, Route } from "wouter";
import { AuthProvider } from "@/context/AuthContext";
import { ProjectProvider } from "@/context/ProjectContext";

// Lazy: if UI-v2 pages exist, try a couple of known routes.
// You can adjust these later as we wire pages fully.
const Home = () => <div style={{padding:16}}>CRT app is running. Go to <a href="/briefs">/briefs</a> or <a href="/captures">/captures</a>.</div>;

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <Route path="/" component={Home} />
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
};
export default App;
