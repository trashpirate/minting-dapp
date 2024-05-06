import Link from "next/link";

type Props = {};

export default function Footer({ }: Props) {
    return (
        <footer className="text-secondary text-center my-8 text-opacity-60 bottom-0 z-50 px-8 text-sm">
            <div>
                Created by <Link className="font-bold" href="https://twitter.com/laylascreations">@laylascreations</Link> & <Link className="font-bold" href="https://twitter.com/N0_crypto">@N0_crypto</Link>
            </div>

        </footer>);
}