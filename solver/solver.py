import sys
import json

from ortools.sat.python import cp_model


def solve_allocation(data):
    # --------------------------------------------------------
    # 1. Read input data
    # --------------------------------------------------------

    students = data["students"]
    courses = data["courses"]
    preferences = data["preferences"]

    # --------------------------------------------------------
    # 2. Create the CP-SAT model
    # --------------------------------------------------------

    model = cp_model.CpModel()

    # --------------------------------------------------------
    # 3. Create decision variables
    #
    # assignment[(student, course)] = 1
    # means that the student is assigned to that course.
    # --------------------------------------------------------

    assignment = {}

    for student in students:
        for course in courses:
            assignment[(student, course)] = model.NewBoolVar(
                f"{student}_{course}"
            )

    # --------------------------------------------------------
    # 4. Students can only receive courses they selected
    #
    # If a student did not rank a course, that assignment is
    # explicitly forbidden.
    # --------------------------------------------------------

    for student in students:
        student_preferences = preferences.get(student, [])

        for course in courses:
            if course not in student_preferences:
                model.Add(
                    assignment[(student, course)] == 0
                )

    # --------------------------------------------------------
    # 5. Every student gets exactly one course
    #
    # Because unranked courses are forbidden above, this also
    # means a student must have at least one preference.
    # --------------------------------------------------------

    for student in students:
        model.Add(
            sum(
                assignment[(student, course)]
                for course in courses
            ) == 1
        )

    # --------------------------------------------------------
    # 6. Course capacity constraints
    # --------------------------------------------------------

    for course, capacity in courses.items():
        model.Add(
            sum(
                assignment[(student, course)]
                for student in students
            ) <= capacity
        )

    # --------------------------------------------------------
    # 7. Preference scores
    #
    # Rank 1 -> 100 points
    # Rank 2 -> 50 points
    # Rank 3 -> 10 points
    #
    # These are the scores used by the optimization objective.
    # --------------------------------------------------------

    preference_scores = data.get(
      "preferenceScores",
       {
         0: 100,
         1: 50,
         2: 10,
      }
    )

    preference_scores = {
      int(rank): int(score)
      for rank, score in preference_scores.items()
    }

    # --------------------------------------------------------
    # 8. Build optimization objective
    #
    # Maximize total student satisfaction.
    # --------------------------------------------------------

    total_satisfaction = []

    for student in students:
        student_preferences = preferences.get(
            student,
            []
        )

        for rank, course in enumerate(
            student_preferences
        ):
            # Only courses known to the system should be
            # considered.
            if course not in courses:
                continue

            # Currently our scoring model supports the first
            # three preference ranks.
            if rank not in preference_scores:
                continue

            score = preference_scores[rank]

            total_satisfaction.append(
                assignment[(student, course)] * score
            )

    model.Maximize(
        sum(total_satisfaction)
    )

    # --------------------------------------------------------
    # 9. Solve
    # --------------------------------------------------------

    solver = cp_model.CpSolver()

    status = solver.Solve(model)

    # --------------------------------------------------------
    # 10. Handle infeasible / failed allocation
    # --------------------------------------------------------

    if status not in [
        cp_model.OPTIMAL,
        cp_model.FEASIBLE,
    ]:
        return {
            "status": "infeasible",
            "totalScore": 0,
            "allocations": [],
        }

    # --------------------------------------------------------
    # 11. Extract allocations
    # --------------------------------------------------------

    allocations = []
    total_score = 0

    for student in students:
        student_preferences = preferences.get(
            student,
            []
        )

        for course in courses:

            if solver.Value(
                assignment[(student, course)]
            ):

                # This should always be true because of the
                # constraints above, but keeping the check makes
                # the output logic defensive.
                if course not in student_preferences:
                    continue

                rank = student_preferences.index(
                    course
                )

                score = preference_scores.get(
                    rank,
                    0
                )

                allocations.append({
                    "student": student,
                    "course": course,
                    "preferenceRank": rank + 1,
                    "score": score,
                })

                total_score += score

    # --------------------------------------------------------
    # 12. Return result
    # --------------------------------------------------------

    return {
        "status": (
            "optimal"
            if status == cp_model.OPTIMAL
            else "feasible"
        ),
        "totalScore": total_score,
        "allocations": allocations,
    }


def main():
    # --------------------------------------------------------
    # Read JSON sent by Node through stdin
    # --------------------------------------------------------

    input_data = sys.stdin.read()

    data = json.loads(input_data)

    result = solve_allocation(data)

    # --------------------------------------------------------
    # Send JSON result back to Node through stdout
    # --------------------------------------------------------

    print(json.dumps(result))


if __name__ == "__main__":
    main()