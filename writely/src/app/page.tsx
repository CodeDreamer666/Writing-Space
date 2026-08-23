import Comparison from "~/components/landing/Comparison";
import FinalCallToAction from "~/components/landing/FinalCallToAction";
import Hero from "~/components/landing/Hero";
import HowItWorks from "~/components/landing/HowItWorks";
import LandingHeader from "~/components/landing/LandingHeader";

export default function LandingPage() {
    return (
        <main
            data-writely-landing-page
            className="min-h-screen bg-(--w-background) text-(--w-foreground)"
        >
            <LandingHeader />
            <Hero />
            <HowItWorks />
            <Comparison />
            <FinalCallToAction />
        </main>
    );
}
