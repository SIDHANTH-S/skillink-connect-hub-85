
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, isAuthenticated } from "@/utils/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardHat } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("test@skillink.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated()) {
    navigate("/select-role");
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simple validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    // Attempt login
    const success = login(email, password);

    if (success) {
      navigate("/select-role");
    } else {
      setError("Invalid credentials. Try test@skillink.com / 123456");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-skillink-light">
      <div className="w-full max-w-md p-4">
        <div className="flex justify-center mb-4">
          <div className="bg-skillink-primary p-3 rounded-full text-white">
            <HardHat size={36} />
          </div>
        </div>
        
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Skillink 24/7</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-500 p-1">{error}</div>
                )}
                <Button 
                  className="w-full bg-skillink-primary hover:bg-skillink-dark" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-muted-foreground mt-2">
              <span className="text-skillink-primary font-semibold">Default credentials:</span> test@skillink.com / 123456
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
