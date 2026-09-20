import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, CheckCircle2, Phone, Mail, Globe, AlertCircle, Info, Scale } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | FranceGo VIP Transfers & Tours',
  description:
    'Review the official terms and conditions for private airport transfers and luxury chauffeur services provided by FranceGo VIP Transfers & Tours.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* HERO SECTION */}
      <section className="bg-[#0B192C] text-white py-16 border-b border-[#1E2D42]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 px-3.5 py-1.5 rounded-full text-gold-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-serif">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
            Last updated: September 2026 • FranceGo VIP Transfers & Tours
          </p>
        </div>
      </section>

      {/* MAIN DOCUMENT BODY */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-10 text-xs sm:text-sm leading-relaxed text-slate-700">

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600 shrink-0" />
              <span>1. SERVICE DESCRIPTION</span>
            </h2>
            <p>
              FranceGo VIP Transfers & Tours provides private transportation and chauffeur services throughout France and Europe.
            </p>
            <p className="font-semibold text-slate-900">Our services may include:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Private airport transfers to and from Paris Charles de Gaulle (CDG), Orly (ORY), and Beauvais-Tillé (BVA);</li>
              <li>Transfers to and from train stations;</li>
              <li>Private intercity transfers throughout France and Europe;</li>
              <li>Transfers to Disneyland Paris, Versailles, the Loire Valley, Normandy, Champagne, and other destinations;</li>
              <li>Private chauffeur services and vehicle disposal by the hour or by the day;</li>
              <li>Private sightseeing tours and customized itineraries;</li>
              <li>Transportation services for individuals, families, companies, travel agencies, DMCs, and other professional partners;</li>
              <li>Transportation for groups using suitable vehicles, including cars, vans, minibuses, and coaches, subject to availability.</li>
            </ul>
            <p>
              All services are provided on a private basis unless otherwise agreed in writing. The vehicle is reserved for the client and the passengers included in the booking.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold-600 shrink-0" />
              <span>2. BOOKING AND RESERVATION</span>
            </h2>
            
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">2.1 Booking Information</h3>
              <p>
                To make a reservation, the client must provide accurate and complete information, including the passenger&apos;s name, contact details, date and time of pickup, pickup and drop-off locations, number of passengers, luggage information when relevant, flight or train details when applicable, and any special requirements.
              </p>
              <p>The client is responsible for ensuring that all information provided to FranceGo is accurate.</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">2.2 Booking Confirmation</h3>
              <p>
                A booking is considered confirmed once FranceGo VIP Transfers & Tours has sent a written confirmation by email, WhatsApp, booking platform, or another agreed communication method.
              </p>
              <p>
                The confirmation may include the date, pickup time, pickup location, destination, vehicle type, price, and relevant service instructions.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">2.3 Last-Minute Bookings</h3>
              <p>
                Last-minute bookings may be accepted subject to vehicle and driver availability. A last-minute request is not considered confirmed until FranceGo expressly confirms it.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600 shrink-0" />
              <span>3. PRICING AND PAYMENT</span>
            </h2>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">3.1 Pricing</h3>
              <p>
                The price of the service is communicated to the client before the service is performed. When a fixed price is confirmed in advance, it covers the services expressly stated in the quotation or booking confirmation.
              </p>
              <p>
                Tolls, parking fees, entrance fees, or other specific expenses are included or excluded according to the conditions stated at the time of booking.
              </p>
              <p>
                No additional charge that was not previously disclosed will be applied without informing the client, except where the additional cost results from a request or change made by the client during the service.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">3.2 Payment Methods</h3>
              <p>
                Depending on the service and the agreed booking conditions, payment may be made by credit/debit card, cash, bank transfer, payment link, or another payment method accepted by FranceGo.
              </p>
              <p>
                For certain bookings, including professional bookings, group services, or services requiring dedicated vehicles, a deposit or full payment may be required before the service.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">3.3 Additional Services</h3>
              <p>
                Additional services requested after confirmation may be charged separately. These may include extended chauffeur service, significant itinerary changes, additional stops, additional pickup or drop-off locations, vehicle upgrades, or other specific services requested by the client.
              </p>
              <p>
                Where possible, the client will be informed of any additional charge before the additional service is provided.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">3.4 Child Seats</h3>
              <p>
                Baby seats and booster seats may be provided upon prior request, subject to availability. The client must provide the child&apos;s age and, where necessary, weight and/or height so that an appropriate seat can be arranged.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gold-600 shrink-0" />
              <span>4. CANCELLATION AND MODIFICATION POLICY</span>
            </h2>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">4.1 Cancellation by the Client</h3>
              <p>
                Unless specific conditions apply to the booking, cancellations made more than 24 hours before the scheduled pickup time may be made without cancellation fees.
              </p>
              <p>
                For cancellations made less than 24 hours before the scheduled service, cancellation charges may apply depending on the nature of the booking.
              </p>
              <p>
                Specific cancellation conditions may apply to private tours, long chauffeur bookings, group services, or bookings requiring a dedicated vehicle. Any such conditions will be communicated before confirmation.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">4.2 Modifications</h3>
              <p>
                Changes to the date, time, pickup location, destination, vehicle, or number of passengers must be communicated as soon as possible. Changes are subject to availability and may result in a change of price.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">4.3 No-Show</h3>
              <p>
                If the client fails to appear at the agreed pickup location without prior notice, the service may be considered a no-show and charged according to the applicable booking conditions.
              </p>
              <p>
                For airport pickups, FranceGo may take the flight information provided at the time of booking into account.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-gold-600 shrink-0" />
              <span>5. PICKUP AND AIRPORT TRANSFER SERVICES</span>
            </h2>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">5.1 Airport Arrivals</h3>
              <p>
                For airport arrivals, the driver may wait at the agreed meeting point and, where included in the service, hold a name board displaying the passenger&apos;s name.
              </p>
              <p>
                Detailed pickup instructions and the driver&apos;s contact information may be provided to the client before or on the day of the service.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">5.2 Flight Delays</h3>
              <p>
                When the flight number has been correctly provided at the time of booking, FranceGo may monitor the flight and adjust the pickup time where reasonably possible.
              </p>
              <p>
                Where a flight delay results in a significantly extended waiting period or requires additional arrangements, any applicable waiting or additional charges will be communicated to the client when possible.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">5.3 Departure Transfers</h3>
              <p>
                Clients are responsible for selecting an appropriate pickup time for airport departures. FranceGo may provide a recommended pickup time based on the flight schedule, estimated travel time, traffic conditions, and the airport&apos;s recommended arrival time.
              </p>
              <p>
                If the client requests a later pickup time than the recommended time, the client accepts responsibility for any consequences resulting from insufficient travel time, including the risk of missing the flight.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">5.4 Estimated Travel Times</h3>
              <p>
                Travel times provided by FranceGo are estimates only and may vary depending on traffic, road conditions, weather, strikes, accidents, road closures, and other unforeseen circumstances.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold-600 shrink-0" />
              <span>6. VEHICLES AND SERVICE STANDARDS</span>
            </h2>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">6.1 Vehicles</h3>
              <p>
                FranceGo uses professional, clean, air-conditioned, and non-smoking vehicles. Vehicle capacity depends on the vehicle selected and the number of passengers and luggage included in the booking.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">6.2 Drivers</h3>
              <p>
                Drivers assigned to services are professional and appropriately licensed or authorized in accordance with applicable regulations. English- and French-speaking drivers may be provided subject to availability.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">6.3 Safety</h3>
              <p>
                FranceGo complies with applicable transportation and road-safety requirements. Passengers must follow reasonable safety instructions given by the driver.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">6.4 Gratuities</h3>
              <p>
                Tipping is entirely at the client&apos;s discretion and is not mandatory.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600 shrink-0" />
              <span>7. MULTIPLE PICKUPS AND DROPOFFS</span>
            </h2>
            <p>
              Multiple pickup or drop-off locations may be arranged when requested in advance and when operationally possible.
            </p>
            <p>
              The client must provide all relevant locations and passenger details at the time of booking. Additional charges may apply depending on the number of stops, distance, waiting time, and vehicle requirements.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-gold-600 shrink-0" />
              <span>8. LIMITATION OF LIABILITY</span>
            </h2>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">8.1 Force Majeure</h3>
              <p>
                FranceGo shall not be liable for delays, cancellations, or failure to perform caused by circumstances beyond its reasonable control, including severe weather, traffic incidents, road closures, strikes, demonstrations, civil unrest, war, government measures, natural disasters, technical failures, or other force majeure events.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">8.2 Personal Belongings</h3>
              <p>
                Passengers remain responsible for their personal belongings throughout the journey. FranceGo takes reasonable precautions but cannot be held responsible for loss, theft, or damage to luggage or personal items left unattended or lost during transportation, except where liability cannot legally be excluded.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">8.3 Travel Insurance</h3>
              <p>
                Clients are encouraged to obtain appropriate travel insurance covering cancellation, delays, missed connections, medical expenses, luggage, and other travel-related risks.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gold-600 shrink-0" />
              <span>9. PASSENGER CONDUCT</span>
            </h2>
            <p>
              Passengers must behave respectfully and comply with reasonable instructions from the driver concerning safety and conduct.
            </p>
            <p>
              FranceGo reserves the right to refuse or terminate a service where a passenger is intoxicated, abusive, threatening, violent, or behaves in a manner that may endanger the driver, other passengers, the vehicle, or third parties.
            </p>
            <p>
              No refund will necessarily be due where the service is terminated because of serious passenger misconduct.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold-600 shrink-0" />
              <span>10. PRIVACY AND PERSONAL DATA</span>
            </h2>
            <p>
              FranceGo collects and processes personal information necessary to manage reservations, provide transportation services, communicate with clients, process payments, and comply with legal obligations.
            </p>
            <p>
              Personal data is handled in accordance with applicable French and European data-protection legislation and FranceGo&apos;s Privacy Policy.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-gold-600 shrink-0" />
              <span>11. GOVERNING LAW AND JURISDICTION</span>
            </h2>
            <p>
              These Terms and Conditions are governed by the laws of France.
            </p>
            <p>
              Any dispute shall be handled in accordance with applicable French law and, where legally permitted, by the competent courts having jurisdiction over FranceGo&apos;s registered office.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600 shrink-0" />
              <span>12. AMENDMENTS</span>
            </h2>
            <p>
              FranceGo reserves the right to update or amend these Terms and Conditions when necessary. The version applicable to a booking is the version in force at the time the booking is confirmed, unless otherwise required by applicable law.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-gold-600 shrink-0" />
              <span>13. CONTACT INFORMATION</span>
            </h2>
            <p>
              For any questions, reservations, or customer support regarding these Terms & Conditions, please contact us:
            </p>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 font-semibold text-xs sm:text-sm">
              <p className="text-slate-900 font-bold text-base">FranceGo VIP Transfers & Tours</p>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-gold-600 shrink-0" />
                <span>Email: <a href="mailto:projet15df@outlook.fr" className="text-gold-700 hover:underline">projet15df@outlook.fr</a></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-gold-600 shrink-0" />
                <span>Phone / WhatsApp: <a href="https://wa.me/33781118394" target="_blank" rel="noopener noreferrer" className="text-gold-700 hover:underline">+33 7 81 11 83 94</a></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Globe className="w-4 h-4 text-gold-600 shrink-0" />
                <span>Website: FranceGo VIP Transfers & Tours</span>
              </div>
            </div>
          </section>

          {/* Section 14 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600 shrink-0" />
              <span>14. SEVERABILITY</span>
            </h2>
            <p>
              If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect to the extent permitted by law.
            </p>
          </section>

          {/* Section 15 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold-600 shrink-0" />
              <span>15. ENTIRE AGREEMENT</span>
            </h2>
            <p>
              These Terms and Conditions, together with the applicable booking confirmation, quotation, and any specific conditions communicated to the client, constitute the agreement between the client and FranceGo regarding the relevant service and supersede prior understandings relating to that service.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}

