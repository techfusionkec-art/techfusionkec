"use client";

import React, { useState, useMemo } from "react";
import { 
  Check, 
  Search, 
  Info, 
  Phone, 
  Mail, 
  MapPin,
  ChevronDown, 
  ExternalLink,
  Copy
} from "lucide-react";
import { SparklesIcon } from "@heroicons/react/24/solid";

// --- MOCK DATA (Replacing Redux) ---
const MOCK_EVENTS = [
  {
    _id: "1",
    eventId: "EVT001",
    name: "RoboWar",
    coordinators: [
      { name: "Amit Kumar", phone: "+91 9876543210", email: "amit@techfusion.com" },
      { name: "Priya Singh", phone: "+91 9876543211", email: "priya@techfusion.com" }
    ]
  },
  {
    _id: "2",
    eventId: "EVT002",
    name: "CodeBlitz",
    coordinators: [
      { name: "Rahul Verma", phone: "+91 8888888888", email: "rahul@techfusion.com" }
    ]
  },
  {
    _id: "3",
    eventId: "EVT003",
    name: "Bridge Building",
    coordinators: [
      { name: "Sneha Gupta", phone: "+91 7777777777", email: "sneha@techfusion.com" },
      { name: "Vikram Das", phone: "+91 6666666666", email: "vikram@techfusion.com" }
    ]
  },
  {
    _id: "4",
    eventId: "EVT004",
    name: "Cyber Hunt",
    coordinators: [] 
  }
];

// --- GENERAL CONTACT COORDINATORS DATA ---
const GENERAL_COORDINATORS = [
  {
    id: 1,
    name: "Kshitiz",
    role: "Senior Coordinator",
    phone: "TBD",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Kshitiz&backgroundColor=b6e3f4"
  },
  {
    id: 2,
    name: "Zafar Sadique",
    role: "Coordinator",
    phone: "+91 62033 18221",
    avatar: "https://res.cloudinary.com/dc21rx5fi/image/upload/v1765281434/ZafarSadique_-_Zafar_Sadique_1_rp90wl.jpg"
  },
  {
    id: 3,
    name: "Madhav Kumar",
    role: "Coordinator",
    phone: "+91 78569 83782",
    avatar: "https://res.cloudinary.com/dc21rx5fi/image/upload/v1765403279/madhav_fnoag6.jpg"
  }
];

// --- UTILITY COMPONENTS ---

const cn = (...classes) => classes.filter(Boolean).join(" ");

// 1. Custom Accordion Component
const Accordion = ({ children, type = "single", collapsible = false }) => {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (value) => {
    if (openItem === value && collapsible) {
      setOpenItem(null);
    } else {
      setOpenItem(value);
    }
  };

  return (
    <div className="w-full space-y-2">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { 
          isOpen: child.props.value === openItem, 
          onToggle: () => toggleItem(child.props.value) 
        })
      )}
    </div>
  );
};

const AccordionItem = ({ children, isOpen, onToggle, className }) => {
  return (
    <div className={cn("border-b border-white/10", className)}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { isOpen, onToggle })
      )}
    </div>
  );
};

const AccordionTrigger = ({ children, isOpen, onToggle, className }) => (
  <button
    onClick={onToggle}
    className={cn(
      "flex flex-1 items-center justify-between py-4 font-medium transition-all w-full text-left",
      className
    )}
  >
    {children}
    <ChevronDown
      className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
    />
  </button>
);

const AccordionContent = ({ children, isOpen, className }) => (
  <div
    className={cn(
      "overflow-hidden text-sm transition-all duration-300 ease-in-out",
      isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
    )}
  >
    <div className={className}>{children}</div>
  </div>
);

// 2. Inline Coordinator Card
const CoordinatorCard = ({ data, eventLabel }) => {
  return (
    <div className="w-full max-w-sm bg-slate-900/50 border border-white/10 rounded-xl p-6 hover:bg-slate-800/80 transition-colors shadow-lg group relative overflow-hidden backdrop-blur-md">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-400/30 transition-all"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white mb-4 shadow-inner ring-4 ring-white/5">
          {data.name.charAt(0)}
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{data.name}</h3>
        <p className="text-xs text-cyan-400 uppercase tracking-wider font-semibold mb-4">
          Coordinator
        </p>
        
        <div className="w-full space-y-3">
            {data.phone && (
              <a href={`tel:${data.phone}`} className="flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white transition-colors bg-white/5 py-2 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/10">
                <Phone className="h-4 w-4" />
                {data.phone}
              </a>
            )}
            {data.email && (
              <a href={`mailto:${data.email}`} className="flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white transition-colors bg-white/5 py-2 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/10">
                <Mail className="h-4 w-4" />
                {data.email}
              </a>
            )}
        </div>
      </div>
    </div>
  );
};

// 3. Custom Search/Combobox
const EventSearch = ({ events, onSelect, selectedId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return events;
    return events.filter(e => e.label.toLowerCase().includes(query.toLowerCase()));
  }, [events, query]);

  const selectedLabel = events.find(e => e.value === selectedId)?.label;

  return (
    <div className="relative w-full max-w-md">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between h-12 px-4 bg-slate-900/50 border border-white/20 rounded-lg text-white hover:bg-slate-800/80 cursor-pointer transition-colors backdrop-blur-sm shadow-md"
      >
        <span className={selectedId ? "text-white" : "text-gray-400"}>
            {selectedId ? selectedLabel : "Search for an event..."}
        </span>
        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 border-b border-white/10 flex items-center">
               <Search className="mr-2 h-4 w-4 text-gray-400" />
               <input 
                 autoFocus
                 className="flex-1 bg-transparent outline-none text-white text-sm placeholder-gray-500"
                 placeholder="Type event name..."
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
               />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="p-3 text-center text-sm text-gray-500">No event found.</div>
              ) : (
                filtered.map((evt) => (
                  <div
                    key={evt.value}
                    onClick={() => {
                      onSelect(evt.value);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm text-gray-200 rounded-md cursor-pointer hover:bg-white/10 hover:text-white transition-colors",
                      selectedId === evt.value && "bg-white/10 text-white"
                    )}
                  >
                    <Check className={cn("mr-2 h-4 w-4", selectedId === evt.value ? "opacity-100" : "opacity-0")} />
                    {evt.label}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- MAIN PAGE ---

export const ContactUsPage = () => {
  const [selectedEventId, setSelectedEventId] = useState("");

  const searchableEvents = useMemo(() => {
    return MOCK_EVENTS.map((evt) => ({
      label: `${evt.eventId} - ${evt.name}`,
      value: evt._id,
      originalData: evt,
    }));
  }, []);

  const selectedEventData = useMemo(() => {
    return searchableEvents.find((evt) => evt.value === selectedEventId);
  }, [selectedEventId, searchableEvents]);

  const activeCoordinators = selectedEventData?.originalData?.coordinators || [];

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center py-12 px-4 md:px-6 font-sans text-slate-100">
      
      <div className="w-full max-w-5xl">

        {/* --- PAGE TITLE --- */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have questions? We\'re here to help you with everything related to TechFusion.
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full mt-6" />
        </div>

        {/* --- GENERAL CONTACT INFO SECTION --- */}
        {/* Changed layout: 2 columns on lg screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 items-stretch">
          
          {/* LEFT COLUMN: Call Us Card (Taller Content) */}
          <div className="h-full">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center hover:bg-white/10 transition-all duration-300 group shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 relative overflow-hidden h-full">
               {/* Subtle corner accent */}
               <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>

              <div className="h-14 w-14 rounded-full bg-cyan-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ring-1 ring-white/10">
                <Phone className="h-7 w-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Call Us</h3>
              <p className="text-gray-400 text-xs mb-6 uppercase tracking-widest">Available 24/7</p>
              
              <div className="w-full space-y-4 mt-auto mb-auto">
                {GENERAL_COORDINATORS.map((person) => (
                  <div key={person.id} className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5 hover:border-cyan-500/30 transition-all group/item">
                    {/* Avatar Image */}
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-white/10 ring-2 ring-cyan-500/20 group-hover/item:ring-cyan-500/50 transition-all shrink-0">
                      <img 
                        src={person.avatar} 
                        alt={person.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {/* Text Details */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-bold text-white group-hover/item:text-cyan-300 transition-colors">{person.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{person.role}</span>
                      <div className="flex items-center gap-2">
                        {/* Visible & Copyable Number */}
                        <span className="text-sm font-mono text-cyan-100/90 font-medium select-all hover:bg-white/10 px-1 -ml-1 rounded transition-colors" title="Click to select">
                          {person.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Stacked Email & Visit */}
          <div className="flex flex-col gap-6 w-full">
            
            {/* Email Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-all duration-300 group shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 flex-1 justify-center">
              <div className="h-14 w-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ring-1 ring-white/10">
                <Mail className="h-7 w-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
              <p className="text-gray-400 text-sm mb-4">
                For general queries and support
              </p>
              <a href="mailto:techfusionkec@gmail.com" className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 rounded-lg text-sm font-medium transition-colors border border-purple-500/20 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                techfusionkec@gmail.com
              </a>
            </div>

            {/* Address Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-all duration-300 group shadow-lg hover:shadow-pink-500/20 hover:-translate-y-1 flex-1 justify-center">
              <div className="h-14 w-14 rounded-full bg-pink-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ring-1 ring-white/10">
                <MapPin className="h-7 w-7 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Visit Us</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Katihar Engineering College<br />
                Hridayganj, Hajipur<br/>
                Katihar, Bihar - 854109
              </p>
              <a href="https://maps.google.com/?q=Katihar+Engineering+College" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 hover:text-pink-200 rounded-lg text-sm font-medium transition-colors border border-pink-500/20 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                View on Map
              </a>
            </div>

          </div>
        </div>

        {/* --- FAQ SECTION --- */}
        <div className="w-full bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-10 shadow-xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 border border-white/5">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              Frequently Asked Questions
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full" />
          </div>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h4 className="flex items-center text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                <SparklesIcon className="text-purple-400 mr-2 h-5 w-5" />
                About TechFusion
              </h4>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-white hover:text-cyan-400 transition-colors">
                    What is TechFusion?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    TechFusion is the annual four-day technical cum cultural festival
                    held at Katihar Engineering College, Katihar. It features a
                    diverse range of events covering various engineering domains and
                    cultural activities.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-white hover:text-cyan-400 transition-colors">
                    What can participants expect?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    Participants can expect engaging technical competitions,
                    workshops, cultural performances, and activities aimed to foster 
                    learning, creativity, and entertainment.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Section 2 */}
            <section>
              <h4 className="flex items-center text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                <SparklesIcon className="text-purple-400 mr-2 h-5 w-5" />
                Participation & Rewards
              </h4>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-white hover:text-cyan-400 transition-colors">
                    What are the benefits of participating?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    Participants receive participation certificates. Winners are
                    awarded merit certificates and cash rewards. The total prize pool
                    amounts to Rs 2 Lakhs across different events.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-white hover:text-cyan-400 transition-colors">
                    How diverse are the events?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    TechFusion hosts a wide array of events encompassing nearly all
                    engineering disciplines, ensuring a platform for participants with
                    varied interests.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Section 3 */}
            <section>
              <h4 className="flex items-center text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                <SparklesIcon className="text-purple-400 mr-2 h-5 w-5" />
                Registration & Venue
              </h4>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-white hover:text-cyan-400 transition-colors">
                    How do I register?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    Register on the website\'s registration page, fill in the
                    required details, and make the payment to the provided bank
                    account. Account verification enables enrollment in desired events.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-white hover:text-cyan-400 transition-colors">
                    When and where is it?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    TechFusion will be held from January 10th to January 13th, 2026,
                    at the Katihar Engineering College campus.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Section 4 */}
            <section>
              <h4 className="flex items-center text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                <SparklesIcon className="text-purple-400 mr-2 h-5 w-5" />
                Accommodation & Food
              </h4>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-white hover:text-cyan-400 transition-colors">
                    Accommodation Details
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    Hostel accommodation is available on campus at Rs 50 per day.
                    Available from January 09th until January 14th. Allotment happens upon arrival.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-white hover:text-cyan-400 transition-colors">
                    Food Options
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    Food is available at the campus canteen/mess. Alternatively, a 
                    food voucher system is available at Rs 70 per meal at our partnered mess.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </div>
        </div>

        {/* --- COORDINATOR LOOKUP SECTION --- */}
        {/* <div id="eventCoordinators" className="w-full flex flex-col items-center">
          <div className="text-center mb-6 max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Need Help with a Specific Event?
            </h3>
            <p className="text-gray-400">
              Select an event below to find the contact details for the respective coordinators.
            </p>
          </div> */}

          {/* Search Input */}
          {/* <div className="w-full max-w-md mb-8">
            <EventSearch 
              events={searchableEvents} 
              selectedId={selectedEventId} 
              onSelect={setSelectedEventId} 
            />
          </div> */}

          {/* Results */}
          {/* {selectedEventId && activeCoordinators.length > 0 ? (
            <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h4 className="text-xl font-bold text-white mb-6 text-center border-b border-white/10 pb-4">
                Coordinators for <span className="text-cyan-400">{selectedEventData?.label}</span>
              </h4>
              <div className="flex flex-wrap justify-center gap-6 w-full">
                {activeCoordinators.map((coordinator, index) => (
                  <CoordinatorCard
                    key={coordinator._id || index}
                    data={coordinator}
                    eventLabel={selectedEventData?.label}
                  />
                ))}
              </div>
            </div>
          ) : selectedEventId && activeCoordinators.length === 0 ? (
            <div className="text-center p-8 bg-white/5 rounded-xl border border-dashed border-white/20">
                <Info className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300">No specific coordinators listed for this event.</p>
            </div>
          ) : null} */}
        {/* </div> */}
      </div>
    </div>
  );
};

export default ContactUsPage;