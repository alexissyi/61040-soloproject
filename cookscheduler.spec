<concept_spec>
concept CookScheduler

purpose
    create cooking assignments for the month so we know who cooks when

principle
    user availabilities and preferences are uploaded by all users independently;
    cooking dates are added based on WILG meal plan calendar;
    can then use LLM to generate cooking assignments that satisfy the constraints;
    can also edit the resulting assignments;

state
    a Month

    a Year

    a set of Dates CookingDates

    a set of User Cooks

    a set of Availability Availabilities with
        a User
        a set of Dates

    a set of Preference Preferences with
        a User
        a boolean CanSolo
        a boolean CanLead
        a boolean CanAssist
        a number MaxCookingDays
        
    a set of Assignment Assignments with
        a Date
        a Lead
        an optional Assistant

    invariants
        all dates in CookingDates are in Month in Year
        every Preference in Preferences has a nonnegative, integer maxCookingDays
        every Assignment in Assignments has a Date in CookingDates and a Lead in Cooks; if it has an Assistant, the Assistant is in Cooks

actions    
    addCook(user: User):
        requires no User is in Cooks with the same kerb as user
        effect adds user to Cooks

    removeCook(user: User):
        requires user is in Cooks
        effect removes user and any associated Preference, Availability or Assignments

    setMonth(month: number):
        requires month is an integer in [1, 12] and no assignments exist that have a date outside of this month
        effect sets Month to month

    setYear(year: number):
        requires year is a nonnegative integer and no assignments exist that have a date outside of this year
        effect sets Year to year

    addCookingDate(date: Date):
        requires date is not in CookingDates and date is in Month
        effect adds date to CookingDates
    
    removeCookingDate(date: Date):
        requires date is in CookingDates
        effect removes date from CookingDates

    assignLead(user: User, date: Date)
        requires date is in CookingDates; user is in the set of Users, user has CanLead or CanSolo marked as True in their associated Preference
        effect creates a new Assignment with date and Lead set to user if there is no existing Assignment for this date, or updates an existing Assignment if there already is an Assignment for this date
        
    assignAssistant(user: User, date: Date)
        requires date is in CookingDates; user is in Cooks; there is already an Assignment with this date in the set of Assignments, the lead for that assignment has CanLead marked as True in their associated Preference
        effect sets Assistant in the existing Assignment for this date to be user

    removeAssignment(date: Date)
        requires there is an Assignment with this date in the set of Assignments
        effect removes this Assignment from the set of Assignments
    
    upload(preference: Preference)
        requires the User in preference is in Cooks
        effect adds preference to Preferences or updates Preferences if there is already a preference for the user, removes all incompatible Assignments

    upload(availability: Availability)
        requires the User in availability is in Cooks and all dates in availability are in CookingDates
        effect adds availability to Availabilities or updates Availabilities if there is already a availability for the user, removes all incompatible Assignments

    async generateAssignments()
        requires the set of Users for both Availabilities and Preferences are subsets of Cooks and no existing Assignments violate those Availabilities and Preferences
        effect generates an assignment of Users to the CookingDates via an algorithm that violates no constraints in Availabilities or Preferences and satisfies all prior existing Assignments

    async generateAssignmentsWithLLM()
        requires the set of Users for both Availabilities and Preferences are subsets of Cooks and no existing Assignments violate those Availabilities and Preferences
        effect generates an assignment of Users to the CookingDates with an LLM that violates no constraints in Availabilities or Preferences and satisfies all prior existing Assignments

    validate(): boolean
        requires no constraints in Preferences or Availabilities are violated across the Assignments
        effects returns True 
    
</concept_spec>