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
  eventId: string;
  eventName: string;
  salesforceContactId?: string;
  name: string;
  company: string;
  title: string;
  accountOwnerUserId: string;
  accountOwnerName?: string;
  accountOwnerEmail?: string;
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
  firstName?: string;
  lastName?: string;
  email: string;
  title: string;
  company: string;
  accountOwnerName?: string;
  accountOwnerEmail?: string;
  accountOwnerUserId: string;
  contactOwnerUserId: string;
  source: string;
};

type EventWorkspace = {
  id: string;
  name: string;
  region: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  active: boolean;
  owner: string;
  createdDate: string;
  lastModifiedDate: string;
};

type CampaignMember = {
  campaignName: string;
  campaignId: string;
  memberId: string;
  firstName: string;
  lastName: string;
  name: string;
  startDate: string;
  endDate: string;
  memberStatus: string;
  salesforceContactId: string;
  email: string;
  title: string;
  company: string;
  salesforceAccountId: string;
  accountOwnerName: string;
  accountOwnerEmail: string;
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
const campaignMemberStatusOptions = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "RSVP Yes",
    value: "RSVP_Yes",
  },
  {
    label: "Checked In",
    value: "CheckedIn",
  },
  {
    label: "Check-in Yes",
    value: "checkin_yes",
  },
  {
    label: "Declined",
    value: "Declined",
  },
  {
    label: "No Response",
    value: "Sent - No Response",
  },
];

function getStatusLabel(status: string) {
  if (!status) return "No status";

  const match = campaignMemberStatusOptions.find(
    (option) => option.value.toLowerCase() === status.toLowerCase()
  );

  return match?.label || status;
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("checkedin") ||
    normalized.includes("checkin_yes")
  ) {
    return "statusPill attended";
  }

  if (normalized.includes("rsvp_yes") || normalized.includes("responded")) {
    return "statusPill positive";
  }

  if (normalized.includes("declined") || normalized.includes("unsubscribe")) {
    return "statusPill declined";
  }

  if (normalized.includes("no response") || normalized.includes("invited")) {
    return "statusPill pending";
  }

  return "statusPill";
}

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedId, setSelectedId] = useState("");
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

  const [events, setEvents] = useState<EventWorkspace[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [campaignMembers, setCampaignMembers] = useState<CampaignMember[]>([]);
  const [campaignMemberStatusFilter, setCampaignMemberStatusFilter] =
  useState("all");
  const [isLoadingCampaignMembers, setIsLoadingCampaignMembers] =
  useState(false);
  const [campaignMembersError, setCampaignMembersError] = useState("");
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
        setContacts([]);
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

  useEffect(() => {
    async function loadEvents() {
      setIsLoadingEvents(true);
      setEventsError("");

      try {
        const response = await fetch("/api/events");

        if (!response.ok) {
          throw new Error(`Events request failed: ${response.status}`);
        }

        const data = await response.json();
        const eventResults = data.results || [];

        setEvents(eventResults);

        if (eventResults.length > 0) {
          setSelectedEventId(eventResults[0].id);
        }
      } catch (error) {
        console.error("Failed to load events:", error);
        setEventsError("Could not load events from the private Sheet.");
      } finally {
        setIsLoadingEvents(false);
      }
    }

    loadEvents();
  }, []);

  useEffect(() => {
  async function loadCampaignMembers() {
    if (!selectedEventId) {
      setCampaignMembers([]);
      return;
    }

    setIsLoadingCampaignMembers(true);
    setCampaignMembersError("");

    try {
      const statusQuery =
        campaignMemberStatusFilter === "all"
          ? ""
          : `&status=${encodeURIComponent(campaignMemberStatusFilter)}`;

      const response = await fetch(
        `/api/campaign-members?campaignId=${encodeURIComponent(
          selectedEventId
        )}${statusQuery}`
      );

      if (!response.ok) {
        throw new Error(`Campaign members request failed: ${response.status}`);
      }

      const data = await response.json();
      setCampaignMembers(data.results || []);
    } catch (error) {
      console.error("Failed to load campaign members:", error);
      setCampaignMembersError(
        "Could not load campaign contacts from the private Sheet."
      );
      setCampaignMembers([]);
    } finally {
      setIsLoadingCampaignMembers(false);
    }
  }

  loadCampaignMembers();
}, [selectedEventId, campaignMemberStatusFilter]);

  const selectedEvent =
    events.find((event) => event.id === selectedEventId) || events[0] || null;

  const eventContacts = selectedEvent
    ? contacts.filter((contact) => contact.eventId === selectedEvent.id)
    : [];

  const selected = useMemo(
    () =>
      eventContacts.find((contact) => contact.id === selectedId) ||
      eventContacts[0],
    [eventContacts, selectedId]
  );

  useEffect(() => {
    if (!selectedEvent) return;

    if (!eventContacts.some((contact) => contact.id === selectedId)) {
      setSelectedId(eventContacts[0]?.id || "");
    }
  }, [selectedEventId, contacts, selectedEvent, eventContacts, selectedId]);

  const eventFollowups = eventContacts.reduce(
    (sum, contact) => sum + contact.followups.length,
    0
  );

  const eventTags = eventContacts.reduce(
    (sum, contact) => sum + contact.tags.length,
    0
  );

  const uniqueAccounts = new Set(
    eventContacts.map((contact) => contact.company).filter(Boolean)
  ).size;

  const myContacts = eventContacts.filter(
    (contact) => contact.addedByUserId === currentUser.id
  );

  const contactsAddedByUser = eventContacts.reduce<Record<string, number>>(
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

      if (!response.ok) {
        throw new Error(`Salesforce search failed: ${response.status}`);
      }

      const data = await response.json();
      setSalesforceResults(data.results || []);
    } catch (error) {
      console.error("Salesforce search failed:", error);
      alert("Salesforce Sheet search failed.");
    } finally {
      setIsSearchingSalesforce(false);
    }
  }

  function attachSalesforceContact(result: SalesforceSearchResult) {
    if (!selectedEvent) {
      alert("Choose an event before attaching a contact.");
      return;
    }

    const alreadyAttached = eventContacts.some(
      (contact) => contact.salesforceContactId === result.salesforceContactId
    );

    if (alreadyAttached) {
      alert("This Salesforce contact is already attached to this event.");
      return;
    }

    const newContact: Contact = {
      id: String(Date.now()),
      eventId: selectedEvent.id,
      eventName: selectedEvent.name,
      salesforceContactId: result.salesforceContactId,
      name: result.name,
      company: result.company,
      title: result.title,
      accountOwnerUserId: result.accountOwnerUserId,
      accountOwnerName: result.accountOwnerName,
      accountOwnerEmail: result.accountOwnerEmail,
      source: result.source,
      addedByUserId: currentUser.id,
      addedAt: nowLabel(),
      notes: [
        {
          id: `${Date.now()}-source-note`,
          text: `Attached to ${selectedEvent.name} from private Salesforce Sheet. Email: ${
            result.email || "N/A"
          }. Account owner: ${result.accountOwnerName || "N/A"}${
            result.accountOwnerEmail ? ` (${result.accountOwnerEmail})` : ""
          }.`,
          createdByUserId: currentUser.id,
          createdAt: nowLabel(),
        },
      ],
      followups: [],
      tags: [],
    };

    setContacts([newContact, ...contacts]);
    setSelectedId(newContact.id);
    setSearch("");
    setSalesforceResults([]);
  }

  function openOrAttachCampaignMember(member: CampaignMember) {
  if (!selectedEvent) {
    alert("Choose an event before opening a campaign contact.");
    return;
  }

  const existingContact = eventContacts.find(
    (contact) => contact.salesforceContactId === member.salesforceContactId
  );

  if (existingContact) {
    setSelectedId(existingContact.id);
    return;
  }

  const newContact: Contact = {
    id: `${Date.now()}-${member.salesforceContactId}`,
    eventId: selectedEvent.id,
    eventName: selectedEvent.name,
    salesforceContactId: member.salesforceContactId,
    name: member.name,
    company: member.company || "Unknown account",
    title: member.title || "No title",
    accountOwnerUserId: member.accountOwnerEmail
      ? `owner-${member.accountOwnerEmail.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
      : "unknown-owner",
    accountOwnerName: member.accountOwnerName,
    accountOwnerEmail: member.accountOwnerEmail,
    source: member.source,
    addedByUserId: currentUser.id,
    addedAt: nowLabel(),
    notes: [
      {
        id: `${Date.now()}-campaign-member-note`,
        text: `Added from campaign member list. Campaign status: ${
          member.memberStatus || "N/A"
        }. Email: ${member.email || "N/A"}.`,
        createdByUserId: currentUser.id,
        createdAt: nowLabel(),
      },
    ],
    followups: [],
    tags: [],
  };

  setContacts([newContact, ...contacts]);
  setSelectedId(newContact.id);
}

  function removeEventContact(contactId: string) {
    const contactToRemove = contacts.find((contact) => contact.id === contactId);

    if (!contactToRemove) return;

    const confirmRemove = window.confirm(
      `Remove ${contactToRemove.name} from ${contactToRemove.eventName}? This will also remove their notes, follow-ups, and teammate tags from this prototype.`
    );

    if (!confirmRemove) return;

    const remainingContacts = contacts.filter(
      (contact) => contact.id !== contactId
    );

    setContacts(remainingContacts);

    if (selectedId === contactId && selectedEvent) {
      const remainingEventContacts = remainingContacts.filter(
        (contact) => contact.eventId === selectedEvent.id
      );

      setSelectedId(remainingEventContacts[0]?.id || "");
    }
  }

  function saveNote() {
    if (!selected || !captureText.trim()) return;

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
    if (!selected) return;

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
    if (!selected) return;

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
    if (!selected || !editingNoteId) return;

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
    if (!selected) return;

    updateSelectedContact({
      ...selected,
      followups: selected.followups.filter(
        (followup) => followup.id !== followupId
      ),
    });
  }

  function tagSelectedTeammate() {
    if (!selected) return;

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
    if (!selected) return;

    updateSelectedContact({
      ...selected,
      tags: selected.tags.filter((tag) => tag.id !== tagId),
    });
  }

  function importGranola() {
    if (!selected) return;

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
    setContacts([]);
    setSelectedId("");
    setSelectedTagUserId("none");
    setSalesforceResults([]);
    setSearch("");
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

          <div className="eventSelector">
            <label htmlFor="event-select">Event workspace</label>

            <select
              id="event-select"
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setSalesforceResults([]);
                setSearch("");
              }}
              disabled={isLoadingEvents || events.length === 0}
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>

            {selectedEvent && (
              <span>
                {selectedEvent.region || "No region"} ·{" "}
                {selectedEvent.type || "No type"} ·{" "}
                {selectedEvent.startDate || "No start date"}
                {selectedEvent.endDate ? ` - ${selectedEvent.endDate}` : ""}
              </span>
            )}

            {isLoadingEvents && <span>Loading events...</span>}
            {eventsError && <span>{eventsError}</span>}
          </div>
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
          <strong>{selectedEvent?.name || "No event selected"}</strong>
        </div>
        <div>
          <span>Event contacts</span>
          <strong>{eventContacts.length}</strong>
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
          <span>Unique accounts</span>
          <strong>{uniqueAccounts}</strong>
        </div>
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
         <h2>Campaign contacts</h2>
<p className="muted">
  Showing contacts tied to {selectedEvent?.name || "the selected campaign"} from
  the private campaign member Sheet.
</p>

<div className="statusFilterRow">
  {campaignMemberStatusOptions.map((option) => (
    <button
      key={option.value}
      className={
        campaignMemberStatusFilter === option.value
          ? "filterChip active"
          : "filterChip"
      }
      onClick={() => setCampaignMemberStatusFilter(option.value)}
    >
      {option.label}
    </button>
  ))}
</div>

{isLoadingCampaignMembers && (
  <p className="empty">Loading campaign contacts...</p>
)}

{campaignMembersError && <p className="errorText">{campaignMembersError}</p>}

{!isLoadingCampaignMembers &&
  !campaignMembersError &&
  campaignMembers.length === 0 && (
    <p className="empty">
      No campaign contacts found for this event and filter.
    </p>
  )}

{campaignMembers.length > 0 && (
  <div className="campaignMembersList">
    {campaignMembers.map((member) => {
      const alreadyAttached = eventContacts.some(
        (contact) => contact.salesforceContactId === member.salesforceContactId
      );

      return (
        <div
          key={member.memberId || member.salesforceContactId}
          className="campaignMemberCard"
        >
          <button
            className="campaignMemberMain"
            onClick={() => openOrAttachCampaignMember(member)}
          >
            <div className="avatar">{getInitials(member.name || "NA")}</div>

            <div>
              <div className="campaignMemberHeader">
                <strong>{member.name || "Unnamed contact"}</strong>
                <span className={getStatusClass(member.memberStatus)}>
                  {getStatusLabel(member.memberStatus)}
                </span>
              </div>

              <span>
                {member.company || "No account"} · {member.title || "No title"}
              </span>

              <small>
                {member.email || "No email"} · Account owner:{" "}
                {member.accountOwnerName || "Unknown"}
              </small>
            </div>
          </button>

          <button
            className={alreadyAttached ? "attachedButton" : "attachMemberButton"}
            onClick={() => openOrAttachCampaignMember(member)}
          >
            {alreadyAttached ? "Open" : "Add"}
          </button>
        </div>
      );
    })}
  </div>
)}
<div className="manualSearchBox">
  <h3>Manual add</h3>
  <p className="muted">
    Search all Salesforce contacts only if someone is missing from the campaign
    member list.
  </p>

  <div className="searchRow">
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search all Salesforce contacts"
    />
    <button onClick={searchSalesforce}>
      {isSearchingSalesforce ? "Searching..." : "Search"}
    </button>
  </div>

  {salesforceResults.length > 0 && (
    <div className="searchResultsWrap">
      <div className="resultsHeader">
        <strong>
          {salesforceResults.length} Salesforce result
          {salesforceResults.length === 1 ? "" : "s"}
        </strong>
        <button onClick={() => setSalesforceResults([])}>Clear results</button>
      </div>

      <div className="salesforceResults">
        {salesforceResults.map((result) => (
          <div key={result.salesforceContactId} className="salesforceResult">
            <div>
              <strong>{result.name}</strong>
              <span>
                {result.company || "No account"} ·{" "}
                {result.title || "No title"}
              </span>
              <small>
                {result.email || "No email"} · Account owner:{" "}
                {result.accountOwnerName ||
                  getUserName(result.accountOwnerUserId)}
              </small>
            </div>

            <button onClick={() => attachSalesforceContact(result)}>
              Attach to event
            </button>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
          <h2>Event contacts</h2>
          <p className="muted">
            Each contact is linked to {selectedEvent?.name || "this event"} and
            tracks who added them, their Salesforce account owner, notes,
            follow-ups, and teammate tags.
          </p>

          <div className="contacts">
            {eventContacts.length === 0 && (
              <p className="empty">
                No contacts attached to{" "}
                {selectedEvent?.name || "this event"} yet.
              </p>
            )}

            {eventContacts.map((contact) => (
              <div
                key={contact.id}
                className={contact.id === selected?.id ? "contact active" : "contact"}
              >
                <button
                  className="contactMain"
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
                      owner:{" "}
                      {contact.accountOwnerName ||
                        getUserName(contact.accountOwnerUserId)}
                    </small>
                  </div>
                </button>

                <button
                  className="removeContactButton"
                  onClick={() => removeEventContact(contact.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          {!selected ? (
            <div className="emptyStatePanel">
              <h2>No contact selected</h2>
              <p className="muted">
                Search for a Salesforce contact and attach them to{" "}
                {selectedEvent?.name || "the selected event"} to start adding
                notes, follow-ups, and teammate tags.
              </p>
            </div>
          ) : (
            <>
              <h2>{selected.name}</h2>
              <p className="muted">
                {selected.company} · {selected.title}
              </p>

              <div className="pillRow">
                <span>{selected.source}</span>
                <span>Added by: {getUserName(selected.addedByUserId)}</span>
                <span>
                  Account owner:{" "}
                  {selected.accountOwnerName ||
                    getUserName(selected.accountOwnerUserId)}
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

                    <button onClick={tagSelectedTeammate}>
                      Add teammate tag
                    </button>
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
                            onChange={(e) =>
                              setEditingNoteText(e.target.value)
                            }
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
                    {Object.entries(contactsAddedByUser).length === 0 && (
                      <p className="empty">No contacts added for this event yet.</p>
                    )}

                    {Object.entries(contactsAddedByUser).map(
                      ([userId, count]) => (
                        <div key={userId} className="relationshipRow">
                          <strong>{getUserName(userId)}</strong>
                          <span>
                            added {count} contact{count === 1 ? "" : "s"} to{" "}
                            {selectedEvent?.name || "this event"}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h3>Reporting preview</h3>
                  <div className="reportGrid">
                    <div>
                      <span>Event</span>
                      <strong>{selectedEvent?.name || "N/A"}</strong>
                    </div>
                    <div>
                      <span>Contacts</span>
                      <strong>{eventContacts.length}</strong>
                    </div>
                    <div>
                      <span>Unique accounts</span>
                      <strong>{uniqueAccounts}</strong>
                    </div>
                    <div>
                      <span>Follow-ups</span>
                      <strong>{eventFollowups}</strong>
                    </div>
                    <div>
                      <span>Team tags</span>
                      <strong>{eventTags}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}