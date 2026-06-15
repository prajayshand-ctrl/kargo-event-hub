"use client";

import { useEffect, useMemo, useState } from "react";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  region: string;
  salesforceUserId: string;
  slackUserId: string;
  active: boolean;
};

type Note = {
  id: string;
  text: string;
  createdByUserId: string;
  createdAt: string;
};

type Followup = {
  id: string;
  text: string;
  createdByUserId: string;
  assignedToUserId: string;
  createdAt: string;
};

type TeammateTag = {
  id: string;
  taggedUserId: string;
  taggedByUserId: string;
  createdAt: string;
};

type Contact = {
  id: string;
  salesforceContactId?: string;
  name: string;
  company: string;
  title: string;
  accountOwnerUserId: string;
  source: string;
  addedByUserId: string;
  addedAt: string;
  notes: Note[];
  followups: Followup[];
  tags: TeammateTag[];
};

type SalesforceSearchResult = {
  salesforceContactId: string;
  salesforceAccountId: string;
  name: string;
  email: string;
  title: string;
  company: string;
  accountOwnerUserId: string;
  contactOwnerUserId: string;
  source: string;
};

const currentUser: UserProfile = {
  id: "user-prajay",
  name: "Prajay Shand",
  email: "prajay.shand@kargo.com",
  role: "Strategy & Ops",
  team: "BizOps",
  region: "US",
  salesforceUserId: "005-prajay-placeholder",
  slackUserId: "U-prajay-placeholder",
  active: true,
};

const activeSalesReps: UserProfile[] = [
  {
    id: "user-aurelio",
    name: "Aurelio Farrell",
    email: "aurelio.farrell@kargo.com",
    role: "Seller",
    team: "Brand Sales",
    region: "US",
    salesforceUserId: "005-aurelio-placeholder",
    slackUserId: "U-aurelio-placeholder",
    active: true,
  },
  {
    id: "user-clarke",
    name: "Clarke Johnson",
    email: "clarke.johnson@kargo.com",
    role: "Seller",
    team: "Brand Sales",
    region: "US",
    salesforceUserId: "005-clarke-placeholder",
    slackUserId: "U-clarke-placeholder",
    active: true,
  },
  {
    id: "user-dani",
    name: "Dani Halle",
    email: "dani.halle@kargo.com",
    role: "Seller",
    team: "Brand Sales",
    region: "US",
    salesforceUserId: "005-dani-placeholder",
    slackUserId: "U-dani-placeholder",
    active: true,
  },
  {
    id: "user-jerry",
    name: "Jerry Gehrung",
    email: "jerry.gehrung@kargo.com",
    role: "Seller",
    team: "Brand Sales",
    region: "US",
    salesforceUserId: "005-jerry-placeholder",
    slackUserId: "U-jerry-placeholder",
    active: true,
  },
  {
    id: "user-naina",
    name: "Naina Thangada",
    email: "naina.thangada@kargo.com",
    role: "Seller",
    team: "Brand Sales",
    region: "US",
    salesforceUserId: "005-naina-placeholder",
    slackUserId: "U-naina-placeholder",
    active: true,
  },
];

const allUsers = [currentUser, ...activeSalesReps];

const starterContacts: Contact[] = [
  {
    id: "contact-jane",
    salesforceContactId: "003-jane-placeholder",
    name: "Jane Smith",
    company: "Netflix",
    title: "VP, Partnerships",
    accountOwnerUserId: "user-clarke",
    source: "Salesforce synced",
    addedByUserId: "user-prajay",
    addedAt: "Prototype seed",
    notes: [
      {
        id: "note-1",
        text: "Interested in attention measurement.",
        createdByUserId: "user-prajay",
        createdAt: "Prototype seed",
      },
      {
        id: "note-2",
        text: "Asked for case study after Cannes.",
        createdByUserId: "user-prajay",
        createdAt: "Prototype seed",
      },
    ],
    followups: [
      {
        id: "followup-1",
        text: "Send attention case study",
        createdByUserId: "user-prajay",
        assignedToUserId: "user-prajay",
        createdAt: "Prototype seed",
      },
    ],
    tags: [
      {
        id: "tag-1",
        taggedUserId: "user-clarke",
        taggedByUserId: "user-prajay",
        createdAt: "Prototype seed",
      },
    ],
  },
  {
    id: "contact-mike",
    salesforceContactId: "003-mike-placeholder",
    name: "Mike Jones",
    company: "GroupM",
    title: "SVP, Media",
    accountOwnerUserId: "user-aurelio",
    source: "Salesforce synced",
    addedByUserId: "user-prajay",
    addedAt: "Prototype seed",
    notes: [
      {
        id: "note-3",
        text: "Mentioned possible Q4 RFP.",
        createdByUserId: "user-prajay",
        createdAt: "Prototype seed",
      },
    ],
    followups: [
      {
        id: "followup-2",
        text: "Send capabilities email",
        createdByUserId: "user-prajay",
        assignedToUserId: "user-prajay",
        createdAt: "Prototype seed",
      },
    ],
    tags: [],
  },
];

function getUserName(userId: string) {
  return allUsers.find((user) => user.id === userId)?.name || "Unknown user";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function nowLabel() {
  return new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>(starterContacts);
  const [selectedId, setSelectedId] = useState("contact-jane");
  const [search, setSearch] = useState("");
  const [salesforceResults, setSalesforceResults] = useState<
  SalesforceSearchResult[]
>([]);
  const [isSearchingSalesforce, setIsSearchingSalesforce] = useState(false);
  const [captureText, setCaptureText] = useState("");
  const [selectedTagUserId, setSelectedTagUserId] = useState("none");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("kargo-event-hub-contacts");

    if (saved) {
      try {
        const parsedContacts = JSON.parse(saved) as Contact[];
        setContacts(parsedContacts);

        if (parsedContacts.length > 0) {
          setSelectedId(parsedContacts[0].id);
        }
      } catch {
        setContacts(starterContacts);
      }
    }

    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) return;

    window.localStorage.setItem(
      "kargo-event-hub-contacts",
      JSON.stringify(contacts)
    );
  }, [contacts, hasLoadedStorage]);

  const selected = useMemo(
    () => contacts.find((contact) => contact.id === selectedId) || contacts[0],
    [contacts, selectedId]
  );

  const eventFollowups = contacts.reduce(
    (sum, contact) => sum + contact.followups.length,
    0
  );

  const eventTags = contacts.reduce(
    (sum, contact) => sum + contact.tags.length,
    0
  );

  const myContacts = contacts.filter(
    (contact) => contact.addedByUserId === currentUser.id
  );

  const contactsAddedByUser = contacts.reduce<Record<string, number>>(
    (acc, contact) => {
      acc[contact.addedByUserId] = (acc[contact.addedByUserId] || 0) + 1;
      return acc;
    },
    {}
  );

  function updateSelectedContact(updatedContact: Contact) {
    setContacts(
      contacts.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
  }

async function searchSalesforce() {
  setIsSearchingSalesforce(true);

  try {
    const response = await fetch(
      `/api/salesforce/search?q=${encodeURIComponent(search)}`
    );

    const data = await response.json();
    setSalesforceResults(data.results || []);
  } catch {
    alert("Salesforce mock search failed.");
  } finally {
    setIsSearchingSalesforce(false);
  }
}

function attachSalesforceContact(result: SalesforceSearchResult) {
  const alreadyAttached = contacts.some(
    (contact) => contact.salesforceContactId === result.salesforceContactId
  );

  if (alreadyAttached) {
    alert("This Salesforce contact is already attached to the event.");
    return;
  }

  const newContact: Contact = {
    id: String(Date.now()),
    salesforceContactId: result.salesforceContactId,
    name: result.name,
    company: result.company,
    title: result.title,
    accountOwnerUserId: result.accountOwnerUserId,
    source: result.source,
    addedByUserId: currentUser.id,
    addedAt: nowLabel(),
    notes: [],
    followups: [],
    tags: [],
  };

  setContacts([newContact, ...contacts]);
  setSelectedId(newContact.id);
  setSearch("");
  setSalesforceResults([]);
}

  function saveNote() {
    if (!captureText.trim()) return;

    updateSelectedContact({
      ...selected,
      notes: [
        {
          id: String(Date.now()),
          text: captureText.trim(),
          createdByUserId: currentUser.id,
          createdAt: nowLabel(),
        },
        ...selected.notes,
      ],
    });

    setCaptureText("");
  }

  function addFollowup() {
    if (!captureText.trim()) {
      alert("Write the follow-up in the text box first.");
      return;
    }

    updateSelectedContact({
      ...selected,
      followups: [
        {
          id: String(Date.now()),
          text: captureText.trim(),
          createdByUserId: currentUser.id,
          assignedToUserId: currentUser.id,
          createdAt: nowLabel(),
        },
        ...selected.followups,
      ],
    });

    setCaptureText("");
  }

  function deleteNote(noteId: string) {
    updateSelectedContact({
      ...selected,
      notes: selected.notes.filter((note) => note.id !== noteId),
    });
  }

  function startEditingNote(note: Note) {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
  }

  function saveEditedNote() {
    if (!editingNoteId) return;

    updateSelectedContact({
      ...selected,
      notes: selected.notes.map((note) =>
        note.id === editingNoteId
          ? {
              ...note,
              text: editingNoteText,
            }
          : note
      ),
    });

    setEditingNoteId(null);
    setEditingNoteText("");
  }

  function deleteFollowup(followupId: string) {
    updateSelectedContact({
      ...selected,
      followups: selected.followups.filter(
        (followup) => followup.id !== followupId
      ),
    });
  }

  function tagSelectedTeammate() {
    if (selectedTagUserId === "none") {
      alert("No teammate selected. This is fine for a 1:1 meeting.");
      return;
    }

    const alreadyTagged = selected.tags.some(
      (tag) => tag.taggedUserId === selectedTagUserId
    );

    if (alreadyTagged) {
      alert("This teammate is already tagged on this contact.");
      return;
    }

    updateSelectedContact({
      ...selected,
      tags: [
        {
          id: `${Date.now()}-${selectedTagUserId}`,
          taggedUserId: selectedTagUserId,
          taggedByUserId: currentUser.id,
          createdAt: nowLabel(),
        },
        ...selected.tags,
      ],
    });

    setSelectedTagUserId("none");
  }

  function deleteTag(tagId: string) {
    updateSelectedContact({
      ...selected,
      tags: selected.tags.filter((tag) => tag.id !== tagId),
    });
  }

  function importGranola() {
    updateSelectedContact({
      ...selected,
      notes: [
        {
          id: String(Date.now()),
          text:
            "Granola import placeholder: paste or link meeting notes here in V1.",
          createdByUserId: currentUser.id,
          createdAt: nowLabel(),
        },
        ...selected.notes,
      ],
    });
  }

  function resetPrototypeData() {
    const confirmReset = window.confirm(
      "Reset prototype data? This will clear saved local browser data."
    );

    if (!confirmReset) return;

    window.localStorage.removeItem("kargo-event-hub-contacts");
    setContacts(starterContacts);
    setSelectedId("contact-jane");
    setSelectedTagUserId("none");
  }

  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="eyebrow">Kargo Internal Prototype</p>
          <h1>Kargo Event Hub</h1>
          <p>
            A mobile-first networking layer on top of Salesforce for events,
            notes, follow-ups, Granola context, and teammate tagging.
          </p>
        </div>

        <div className="userBar">
          <div>
            <strong>Signed in as {currentUser.name}</strong>
            <span>
              {currentUser.role} · {currentUser.team} · {currentUser.email}
            </span>
          </div>
          <button onClick={resetPrototypeData}>Reset prototype data</button>
        </div>
      </section>

      <section className="metrics">
        <div>
          <span>Event</span>
          <strong>Cannes Lions 2027</strong>
        </div>
        <div>
          <span>Event contacts</span>
          <strong>{contacts.length}</strong>
        </div>
        <div>
          <span>Event follow-ups</span>
          <strong>{eventFollowups}</strong>
        </div>
        <div>
          <span>Event teammate tags</span>
          <strong>{eventTags}</strong>
        </div>
      </section>

      <section className="metrics secondaryMetrics">
        <div>
          <span>My contacts added</span>
          <strong>{myContacts.length}</strong>
        </div>
        <div>
          <span>Selected contact follow-ups</span>
          <strong>{selected?.followups.length || 0}</strong>
        </div>
        <div>
          <span>Selected contact tags</span>
          <strong>{selected?.tags.length || 0}</strong>
        </div>
        <div>
          <span>Data status</span>
          <strong>Local saved</strong>
        </div>
      </section>

      <div className="grid">
        <section className="panel">
          <h2>Salesforce read-only search</h2>
          <p className="muted">
            This is mocked for now. Later this search box will call a Vercel API
            route that reads from Salesforce contacts, accounts, and active
            users.
          </p>

          <div className="searchRow">
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search Salesforce contact or account"
  />
  <button onClick={searchSalesforce}>
    {isSearchingSalesforce ? "Searching..." : "Search"}
  </button>
</div>

{salesforceResults.length > 0 && (
  <div className="salesforceResults">
    {salesforceResults.map((result) => (
      <div key={result.salesforceContactId} className="salesforceResult">
        <div>
          <strong>{result.name}</strong>
          <span>
            {result.company} · {result.title}
          </span>
          <small>
            {result.email} · Account owner:{" "}
            {getUserName(result.accountOwnerUserId)}
          </small>
        </div>

        <button onClick={() => attachSalesforceContact(result)}>
          Attach
        </button>
      </div>
    ))}
  </div>
)}
          <h2>Event contacts</h2>
          <p className="muted">
            Each contact tracks who added them, their Salesforce account owner,
            notes, follow-ups, and teammate tags.
          </p>

          <div className="contacts">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                className={
                  contact.id === selected.id ? "contact active" : "contact"
                }
                onClick={() => setSelectedId(contact.id)}
              >
                <div className="avatar">{getInitials(contact.name)}</div>
                <div>
                  <strong>{contact.name}</strong>
                  <span>
                    {contact.company} · {contact.title}
                  </span>
                  <small>
                    Added by {getUserName(contact.addedByUserId)} · Account
                    owner: {getUserName(contact.accountOwnerUserId)}
                  </small>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>{selected.name}</h2>
          <p className="muted">
            {selected.company} · {selected.title}
          </p>

          <div className="pillRow">
            <span>{selected.source}</span>
            <span>Added by: {getUserName(selected.addedByUserId)}</span>
            <span>
              Account owner: {getUserName(selected.accountOwnerUserId)}
            </span>
          </div>

          <div className="contactStats">
            <div>
              <span>Selected contact notes</span>
              <strong>{selected.notes.length}</strong>
            </div>
            <div>
              <span>Selected contact follow-ups</span>
              <strong>{selected.followups.length}</strong>
            </div>
            <div>
              <span>Selected contact tags</span>
              <strong>{selected.tags.length}</strong>
            </div>
          </div>

          <div className="capture">
            <textarea
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              placeholder="Write a note or follow-up here..."
            />

            <div className="tagBox">
              <div className="tagBoxHeader">
                <div>
                  <strong>Tag active sales rep</strong>
                  <p>
                    Choose one rep to loop in, or leave as none for a 1:1
                    meeting.
                  </p>
                </div>
              </div>

              <div className="tagDropdownRow">
                <select
                  value={selectedTagUserId}
                  onChange={(e) => setSelectedTagUserId(e.target.value)}
                >
                  <option value="none">None / 1:1 meeting</option>
                  {activeSalesReps
                    .filter((rep) => rep.active)
                    .map((rep) => (
                      <option key={rep.id} value={rep.id}>
                        {rep.name} — {rep.role} · {rep.region}
                      </option>
                    ))}
                </select>

                <button onClick={tagSelectedTeammate}>Add teammate tag</button>
              </div>
            </div>

            <div className="buttonGrid">
              <button onClick={saveNote}>Save as note</button>
              <button onClick={addFollowup}>Save as follow-up</button>
              <button onClick={importGranola}>Import Granola</button>
            </div>
          </div>

          <div className="sections">
            <div>
              <h3>Notes</h3>
              {selected.notes.length === 0 && (
                <p className="empty">No notes yet.</p>
              )}

              {selected.notes.map((note) => (
                <div key={note.id} className="item">
                  {editingNoteId === note.id ? (
                    <>
                      <textarea
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                      />
                      <div className="miniActions">
                        <button onClick={saveEditedNote}>Save edit</button>
                        <button onClick={() => setEditingNoteId(null)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{note.text}</p>
                      <small>
                        Created by {getUserName(note.createdByUserId)} ·{" "}
                        {note.createdAt}
                      </small>
                      <div className="miniActions">
                        <button onClick={() => startEditingNote(note)}>
                          Edit
                        </button>
                        <button onClick={() => deleteNote(note.id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div>
              <h3>Follow-ups</h3>
              {selected.followups.length === 0 && (
                <p className="empty">No follow-ups yet.</p>
              )}

              {selected.followups.map((followup) => (
                <div key={followup.id} className="item">
                  <p>{followup.text}</p>
                  <small>
                    Created by {getUserName(followup.createdByUserId)} ·
                    Assigned to {getUserName(followup.assignedToUserId)} ·{" "}
                    {followup.createdAt}
                  </small>
                  <div className="miniActions">
                    <button onClick={() => deleteFollowup(followup.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3>Team tags</h3>
              {selected.tags.length === 0 && (
                <p className="empty">
                  No teammate tags. This can be a 1:1 meeting.
                </p>
              )}

              {selected.tags.map((tag) => (
                <div key={tag.id} className="item tagItem">
                  <div>
                    <p>{getUserName(tag.taggedUserId)}</p>
                    <small>
                      Tagged by {getUserName(tag.taggedByUserId)} ·{" "}
                      {tag.createdAt}
                    </small>
                  </div>
                  <button onClick={() => deleteTag(tag.id)}>Delete</button>
                </div>
              ))}
            </div>

            <div>
              <h3>Who is meeting with whom?</h3>
              <div className="relationshipList">
                {Object.entries(contactsAddedByUser).map(([userId, count]) => (
                  <div key={userId} className="relationshipRow">
                    <strong>{getUserName(userId)}</strong>
                    <span>
                      added {count} contact{count === 1 ? "" : "s"} at Cannes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}