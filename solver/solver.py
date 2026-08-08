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
    # --------------------------------------------------------

    assignment = {}

    for student in students:
        for course in courses:
            assignment[(student, course)] = model.NewBoolVar(
                f"{student}_{course}"
            )

    # --------------------------------------------------------
    # 4. Every student gets exactly one course
    # --------------------------------------------------------

    for student in students:
        model.Add(
            sum(
                assignment[(student, course)]
                for course in courses
            ) == 1
        )

    # --------------------------------------------------------
    # 5. Course capacity constraints
    # --------------------------------------------------------

    for course, capacity in courses.items():
        model.Add(
            sum(
                assignment[(student, course)]
                for student in students
            ) <= capacity
        )

    # --------------------------------------------------------
    # 6. Preference scores
    # --------------------------------------------------------

    preference_scores = {
        0: 100,
        1: 50,
        2: 10
    }

    # --------------------------------------------------------
    # 7. Build optimization objective
    # --------------------------------------------------------

    total_satisfaction = []

    for student in students:
        student_preferences = preferences[student]

        for rank, course in enumerate(student_preferences):
            score = preference_scores[rank]

            total_satisfaction.append(
                assignment[(student, course)] * score
            )

    model.Maximize(sum(total_satisfaction))

    # --------------------------------------------------------
    # 8. Solve
    # --------------------------------------------------------

    solver = cp_model.CpSolver()

    status = solver.Solve(model)

    # --------------------------------------------------------
    # 9. Return result
    # --------------------------------------------------------

    if status not in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        return {
            "status": "infeasible",
            "allocations": []
        }

    allocations = []
    total_score = 0

    for student in students:
        for course in courses:

            if solver.Value(assignment[(student, course)]):

                rank = preferences[student].index(course)
                score = preference_scores[rank]

                allocations.append({
                    "student": student,
                    "course": course,
                    "preferenceRank": rank + 1,
                    "score": score
                })

                total_score += score

    return {
        "status": "optimal" if status == cp_model.OPTIMAL else "feasible",
        "totalScore": total_score,
        "allocations": allocations
    }


def main():
    # Read JSON sent by Node through stdin
    input_data = sys.stdin.read()

    data = json.loads(input_data)

    result = solve_allocation(data)

    # Send JSON result back to Node through stdout
    print(json.dumps(result))


if __name__ == "__main__":
    main()