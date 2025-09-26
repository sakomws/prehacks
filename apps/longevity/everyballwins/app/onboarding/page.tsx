import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import OnboardingForm from "./onboarding-form";

export default function OnboardingPage() {

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl space-y-8">
          <Card className="w-full">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                Welcome to the No Sugar Challenge
              </CardTitle>
              <CardDescription>
                Let&apos;s set up your profile to get started with your 2-week
                journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OnboardingForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
