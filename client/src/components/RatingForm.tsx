import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Star } from "lucide-react";
import { Input } from "../components/ui/input";

type RatingFormProps = {
  googleChargerId: string;
  userId: string | null;
  onSubmitSuccess?: () => void;
  existingRating: number;
  total_reviews: number | undefined;
};

export default function RatingForm({
  googleChargerId,
  userId,
  onSubmitSuccess,
  existingRating,
  total_reviews,
}: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentRating, setCurrentRating] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/get-charger-ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ google_charger_id: googleChargerId }),
    })
      .then((res) => res.json())
      .then((data) => setCurrentRating(data.average_rating ?? 0));
  }, [googleChargerId]);

  async function submitRating() {
    setLoading(true);

    const payload = {
      google_charger_id: googleChargerId,
      rating,
      review,
      user_id: userId,
    };

    try {
      const res = await fetch("http://localhost:5000/api/insert-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSubmitSuccess && onSubmitSuccess();

        // refresh rating
        const updated = await fetch(
          "http://localhost:5000/api/get-charger-ratings",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ google_charger_id: googleChargerId }),
          }
        ).then((r) => r.json());

        setCurrentRating(updated.average_rating ?? 0);
        setRating(0);
        setReview("");
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="font-bold text-lg">Rate this Station</h3>

        {/* Show Average Rating */}
        {currentRating !== null && (
          <p className="text-md text-green-500">
            Average Rating:{" "}
            <span className="font-semibold">{currentRating}/5</span>
          </p>
        )}

        {/* Star rating selection */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <Star
              key={value}
              onClick={() => setRating(value)}
              className={`h-8 w-8 cursor-pointer ${
                value <= rating
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Rating number */}
        <p className="font-semibold text-xl">{rating}/5</p>

        {/* Review input */}
        <Input
          placeholder="Write your review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <Button
          disabled={loading || rating === 0}
          onClick={submitRating}
          className="w-full h-12 border-secondary text-secondary hover:bg-secondary/10text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
        >
          {loading ? "Submitting..." : "Submit Rating"}
        </Button>
      </CardContent>
    </Card>
  );
}
