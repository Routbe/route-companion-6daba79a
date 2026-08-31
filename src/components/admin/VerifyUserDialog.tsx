import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setUserVerifiedStatus } from "@/lib/admin-access.functions";
import { verifiedHandleSuggestionList } from "@/lib/verified-handle";

/**
 * Handmatige verificatie door een admin: wettelijke voor- en achternaam zijn
 * verplicht. Bij bevestiging wordt het account geverifieerd, naar de pro-tier
 * getild en krijgt het een root-handle op basis van de naam.
 */
export function VerifyUserDialog({
  userId,
  displayName,
  firstName,
  lastName,
  onDone,
}: {
  userId: string;
  displayName: string | null;
  firstName?: string | null;
  lastName?: string | null;
  onDone?: () => void | Promise<void>;
}) {
  const verify = useServerFn(setUserVerifiedStatus);
  const [open, setOpen] = useState(false);
  const [first, setFirst] = useState(firstName ?? "");
  const [last, setLast] = useState(lastName ?? "");
  const [busy, setBusy] = useState(false);

  const preview = verifiedHandleSuggestionList(`${first} ${last}`.trim())[0] ?? null;

  const submit = async () => {
    if (!first.trim() || !last.trim()) {
      toast.error("Voor- en achternaam zijn verplicht.");
      return;
    }
    setBusy(true);
    try {
      const res = await verify({
        data: { userId, verified: true, firstName: first.trim(), lastName: last.trim() },
      });
      if (res.ok) {
        toast.success(
          res.promotedHandle
            ? `Geverifieerd — nu rout.be/${res.promotedHandle}`
            : "Account geverifieerd en gepromoveerd naar pro.",
        );
        setOpen(false);
        await onDone?.();
      } else {
        toast.error(res.error ?? "Verifiëren is mislukt.");
      }
    } catch {
      toast.error("Verifiëren is mislukt.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="secondary" className="h-8" onClick={() => setOpen(true)}>
        <BadgeCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Verifieer &amp; activeer
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Account verifiëren</DialogTitle>
            <DialogDescription>
              Vul de wettelijke naam in zoals op het identiteitsbewijs. Het account wordt
              geverifieerd, krijgt de pro-tier en verhuist van /u/alias naar rout.be/handle.
              {displayName ? ` Account: ${displayName}.` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="legal-first">Voornaam</Label>
              <Input
                id="legal-first"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                placeholder="Jona"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="legal-last">Achternaam</Label>
              <Input
                id="legal-last"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                placeholder="Delplanche"
              />
            </div>
          </div>

          {preview ? (
            <p className="font-mono text-xs text-muted-foreground">
              Voorstel: rout.be/{preview}
            </p>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Annuleren
            </Button>
            <Button onClick={() => void submit()} disabled={busy}>
              Verifiëren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
