## Augmented Concept

### Original Concept Specification (Unchanged):

**concept** CookingAssignments\[UserAvailabilities, UserPreferences, User\]

**purpose** track cooking assignments for the month so we know who cooks when

**principle** after user availabilities and user preferences are uploaded, can automatically generate a set of cooking assignments, which can then be edited by foodstuds

**state**

a Month

a set of dates CookingDates

a set of Users

a UserAvailabilities Availabilities

a PreferredRoles Preferences

a set of Assignments with

&ensp; a date CookingDate

&ensp; a Lead

&ensp; an Assistant (optional)

**actions**

addCookingDate(date: Date):

**requires** date is not in CookingDates and date is in Month

**effects** adds date to CookingDates

assignLead(user: User, date: Date)

**requires** date is in CookingDates; user is in the set of Users

**effects** creates a new Assignment with date and Lead set to user if there is no existing Assignment for this date, or updates an existing Assignment if there already is an Assignment for this date

assignAssistant(user: User, date: Date)

**requires** date is in CookingDates; user is in the set of Users; there is already an Assignment with this date in the set of Assignments

**effects** sets Assistant in the existing Assignment for this date to be user

removeAssignment(date: Date)

**requires** there is an Assignment with this date in the set of Assignments

**effects** removes this Assignment from the set of Assignments

upload(preferredRoles: PreferredRoles)

**requires** all Users in preferredRoles are in the set of Users

**effects** sets Preferences to preferredRoles

upload(userAvailabilities: UserAvailabilities)

**requires** all Users in userAvailabilities are in the set of Users

**effects** sets Availabilities to userAvailabilities

generateAssignments()

**requires** user is in the set of Users for both Availabilities and Preferences

**effects** generates an assignment of Users to the CookingDates that violates no constraints in Availabilities or Preferences

validate(): boolean

**requires** no constraints in Preferences or Availabilities are violated across the Assignments

**effects** returns True

### LLM-Augmented Concept Specification:

**concept** CookingAssignments\[UserAvailabilities, UserPreferences, User\]

**purpose** track cooking assignments for the month so we know who cooks when

**principle** after user availabilities and user preferences are uploaded, can generate a set of cooking assignments either algorithmically or via an LLM; this set of cooking assignments can be further edited

**state**

a Month

a set of dates CookingDates

a set of Users

a UserAvailabilities Availabilities

a PreferredRoles Preferences

a set of Assignments with

&ensp; a date CookingDate

&ensp; a Lead

&ensp; an Assistant (optional)

**actions**

addCookingDate(date: Date):

**requires** date is not in CookingDates and date is in Month

**effects** adds date to CookingDates

assignLead(user: User, date: Date)

**requires** date is in CookingDates; user is in the set of Users

**effects** creates a new Assignment with date and Lead set to user if there is no existing Assignment for this date, or updates an existing Assignment if there already is an Assignment for this date

assignAssistant(user: User, date: Date)

**requires** date is in CookingDates; user is in the set of Users; there is already an Assignment with this date in the set of Assignments

**effects** sets Assistant in the existing Assignment for this date to be user

removeAssignment(date: Date)

**requires** there is an Assignment with this date in the set of Assignments

**effects** removes this Assignment from the set of Assignments

upload(preferredRoles: PreferredRoles)

**requires** all Users in preferredRoles are in the set of Users

**effects** sets Preferences to preferredRoles

upload(userAvailabilities: UserAvailabilities)

**requires** all Users in userAvailabilities are in the set of Users

**effects** sets Availabilities to userAvailabilities

generateAssignments()

**requires** the set of Users for both Availabilities and Preferences are subsets of the current set of Users and no existing Assignments violate those Availabilities and Preferences

**effects** generates an assignment of Users to the CookingDates via an algorithm that violates no constraints in Availabilities or Preferences and satisfies all prior existing Assignments

generateAssignmentsWithLLM()

**requires** the set of Users for both Availabilities and Preferences are subsets of the current set of Users and no existing Assignments violate those Availabilities and Preferences

**effects** generates an assignment of Users to the CookingDates with an LLM that violates no constraints in Availabilities or Preferences and satisfies all prior existing Assignments

validate(): boolean

**requires** no constraints in Preferences or Availabilities are violated across the Assignments

**effects** returns True

## User Interaction

![UI Journey 1](./images/UIjourneyLLM1.JPG)
![UI Journey 2](./images/UIjourneyLLM2.JPG)
![UI Journey 3](./images/UIjourneyLLM3.JPG)

**User Journey:** Once the members of the house have uploaded their preferences and availabilities, one of the foodstuds will want to make the cooking calendar for the month. They enter CookScheduler and see an empty calendar. Perhaps they already know who needs to be assigned to certain days; for example, maybe one member can only cook on one day in the entire month. They enter these known assignments into the calendar. Then they click on the generate (LLM) button to ask the LLM to generate a set of cooking assignments. After a few moments of waiting, the LLM's assignments are populated into the calendar. Maybe one or two days are empty; the foodstud then goes into the WILG slack to ask if anyone is able to expand their availability so they can fill those days.
