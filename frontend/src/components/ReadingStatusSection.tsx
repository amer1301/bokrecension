import { useEffect, useState } from "react";

type Props = {
  bookId: string;
  token: string;
  pageCount?: number;
  getReadingStatus: (token: string, bookId: string) => Promise<any>;
  updateReadingStatus: (
    token: string,
    data: {
      bookId: string;
      status: string;
      pagesRead: number;
    }
  ) => Promise<any>;
};

export default function ReadingStatusSection({
  bookId,
  token,
  pageCount,
  getReadingStatus,
  updateReadingStatus,
}: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [pagesRead, setPagesRead] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

useEffect(() => {
  if (!token || !bookId) return;

  const fetchStatus = async () => {
    setLoading(true);

    try {
      const data = await getReadingStatus(token, bookId);
      setStatus(data?.status ?? null);
      setPagesRead(data?.pagesRead ?? 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchStatus();
}, [bookId, token]);

  const handleChange = (newStatus: string) => {
  setStatus(newStatus);
};

const handleSave = async () => {
  if (!status) return;

  try {
    setSaving(true);
    setSavedMessage("");

    await updateReadingStatus(token, {
      bookId,
      status,
      pagesRead,
    });

    setSavedMessage("Lässtatus sparad ✓");

    setTimeout(() => {
      setSavedMessage("");
    }, 2000);

  } catch (error) {
    console.error(error);
    setSavedMessage("Kunde inte spara");
  } finally {
    setSaving(false);
  }
};

  if (loading) return <p>Laddar status...</p>;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3>Min lässtatus</h3>

      <select
        value={status ?? ""}
        onChange={(e) =>
          handleChange(e.target.value)
        }
      >
        <option value="">Välj status</option>
        <option value="want_to_read">Vill läsa</option>
        <option value="reading">Läser</option>
        <option value="finished">Klar</option>
      </select>

      {status === "reading" && pageCount && (
        <div style={{ marginTop: "1rem" }}>
          <input
            type="number"
            min={0}
            value={pagesRead}
            onChange={(e) =>
              setPagesRead(Number(e.target.value))
            }
          />

          <div
            style={{
              height: "10px",
              background: "#eee",
              marginTop: "0.5rem",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${
                  (pagesRead / pageCount) * 100
                }%`,
                background: "#4caf50",
              }}
            />
          </div>

<button
  onClick={handleSave}
  disabled={saving}
  style={{
    marginTop: "1rem",
    padding: "0.5rem 1rem",
    cursor: saving ? "not-allowed" : "pointer",
    opacity: saving ? 0.6 : 1,
  }}
>
  {saving ? "Sparar..." : "Spara"}
</button>
{savedMessage && (
  <p style={{ marginTop: "0.5rem", color: "green" }}>
    {savedMessage}
  </p>
)}
        </div>
      )}
    </div>
  );
}