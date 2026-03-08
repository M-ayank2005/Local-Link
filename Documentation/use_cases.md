# Use Cases - Local Link

## 1. Food surplus sharing

Actors: Resident/Shopkeeper, NGO, Resident

Flow:
1. Owner creates surplus listing with quantity, expiry, and pickup details.
2. Nearby users/NGOs browse active listings.
3. NGO/resident claims a listing.
4. Owner confirms pickup completion.

Primary pages:
- `/food`
- `/food/create`
- `/food/dashboard`

## 2. Apartment commerce

Actors: Resident, Shopkeeper

Flow:
1. Resident browses nearby shops and products.
2. Resident adds products to cart and places order.
3. Shopkeeper processes order and updates status.

Primary pages:
- `/commerce`
- `/commerce/cart`
- `/commerce/orders`

## 3. Shared resource pool

Actors: Lender, Borrower

Flow:
1. Lender lists an item with availability and deposit terms.
2. Borrower discovers nearby item and requests booking.
3. Booking is confirmed and deposit is held.
4. Item is returned and booking is closed.

Primary pages:
- `/resources`
- `/resources/item/[id]`
- `/resources/my-items`

## 4. Emergency network

Actors: Resident, Donor, Pharmacy, Admin

Flow:
1. Resident opens emergency dashboard.
2. System returns blood/medicine availability in locality.
3. Resident contacts verified providers/donors.

Primary pages:
- `/emergency`
- `/emergency/blood`
- `/emergency/medicine`

## 5. Skill exchange (planned)

Actors: Service provider, Resident

Flow:
1. Provider creates service listing with schedule and pricing.
2. Resident books provider.
3. Service is completed and reviewed.

Planned pages:
- `/skills`
- `/skills/provider/[id]`
- `/skills/bookings`
