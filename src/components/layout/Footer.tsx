
export default function Footer() {
  return (
    <footer className="py-8 md:py-10 border-t bg-secondary/50">
      <div className="container mx-auto flex flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">
          Powered by AI & Open Data. &copy; {new Date().getFullYear()} Health & Beauty Scanner.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          For informational purposes only. Consult a professional for health advice.
        </p>
      </div>
    </footer>
  );
}
