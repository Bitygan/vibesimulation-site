import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from manim import *
from MANIM_Quick_Set_Up.Particles_Background_Template import add_standard_background

# ====================================================================
# CONFIGURATION
# ====================================================================
# Centralized dictionary for styling, sizing, and timing,
# adhering to the project's Standard Operating Procedure (SOP).
CONFIG = {
    # Tier 1 Didactic Palette (from SOP)
    "SOP_BG_COLOR": BLACK,
    "SOP_WHITE": WHITE,
    "SOP_BLUE": "#2C75B5",          # Primary Concept/Actor (Particle)
    "SOP_YELLOW": "#E5B32A",        # Accent/Emphasis (Displacement Vector)
    "SOP_GREEN": "#2E8B57",         # Supporting Geometry (Path Trace)
    "SOP_RED": "#D94141",           # Highlight/Warning (Negative Sign)

    # Mobject Sizing
    "DOT_RADIUS": 0.08,
    "LABEL_FONT_SIZE": 36,
    "EQUATION_FONT_SIZE": 48,
    "ORIGIN_LABEL_FONT_SIZE": 30,

    # Animation Timings (in seconds)
    "DEFAULT_WAIT": 1.5,
    "LABEL_FADE_DURATION": 0.5,
    "PARTICLE_MOVE_DURATION": 3.0,
    "EQUATION_TRANSFORM_DURATION": 2.0,
}


# ====================================================================
# SCENE DEFINITION
# ====================================================================

class Lesson01_PositionAndDisplacement(Scene):
    """
    Manim scene for Lesson 1: Position, Displacement, and Vectors.

    This scene visualizes the fundamental concepts of 1D kinematics. It follows
    a structured narrative to build intuition about position, the necessity of an
    origin, and the vector nature of displacement.

    Narrative Flow:
    1.  Establishes the "world": a 1D NumberLine with a defined Origin.
    2.  Defines Position: Shows a particle at a specific coordinate (x1).
    3.  Visualizes Displacement: Animates the particle's movement to a new
        position (x2) and represents the change with a displacement vector (Δx).
        The corresponding formula is built and solved on screen.
    4.  Demonstrates Path Independence: Shows the particle taking an indirect
        route between the same two points, emphasizing that displacement only
        cares about the start and end, not the journey.
    5.  Visualizes Negative Displacement: Repeats the process for movement in
        the negative direction, highlighting the directional nature of vectors.
    """
    def construct(self):
        # --- SCENE SETUP (Camera, NumberLine, Origin) ---
        self.particle_system = add_standard_background(self)
        self.camera.background_color = CONFIG["SOP_BG_COLOR"]

        number_line = NumberLine(
            x_range=[-10, 10, 2],
            length=13,
            color=CONFIG["SOP_WHITE"],
            include_numbers=True,
            label_direction=DOWN,
        )
        self.play(Create(number_line))

        origin_dot = Dot(number_line.n2p(0), color=CONFIG["SOP_WHITE"])
        origin_label = Text("Origin", font_size=CONFIG["ORIGIN_LABEL_FONT_SIZE"]).next_to(origin_dot, UP)
        # SFX: Soft 'appear' sound.
        self.play(Write(origin_label), FadeIn(origin_dot, scale=0.5))
        self.wait(CONFIG["DEFAULT_WAIT"])
        self.play(FadeOut(origin_label), FadeOut(origin_dot))
        self.wait(1)

        # --- PART 1: DEFINING POSITION ---
        pos1 = -4
        dot1 = Dot(number_line.n2p(pos1), color=CONFIG["SOP_BLUE"], radius=CONFIG["DOT_RADIUS"])
        label1 = MathTex(f"x_1 = {pos1}", font_size=CONFIG["LABEL_FONT_SIZE"]).next_to(dot1, UP, buff=0.5)
        line1 = DashedLine(dot1.get_center(), number_line.n2p(pos1), stroke_width=2, color=CONFIG["SOP_WHITE"])

        # SFX: Gentle 'place' sound.
        self.play(LaggedStart(FadeIn(dot1), Create(line1), Write(label1), lag_ratio=0.7))
        self.wait(CONFIG["DEFAULT_WAIT"])

        # --- PART 2: VISUALIZING DISPLACEMENT (POSITIVE) ---
        pos2 = 5
        dot2 = Dot(number_line.n2p(pos2), color=CONFIG["SOP_BLUE"], radius=CONFIG["DOT_RADIUS"])
        label2 = MathTex(f"x_2 = {pos2}", font_size=CONFIG["LABEL_FONT_SIZE"]).next_to(dot2, UP, buff=0.5)

        # SFX: Smooth 'whoosh' sound.
        self.play(
            Transform(dot1, dot2),
            Transform(line1, DashedLine(dot2.get_center(), number_line.n2p(pos2), stroke_width=2, color=CONFIG["SOP_WHITE"])),
            Transform(label1, label2),
            run_time=CONFIG["PARTICLE_MOVE_DURATION"]
        )
        particle = dot1  # Rename for clarity
        self.wait(1)
        
        # Draw displacement vector
        displacement_vector = Arrow(
            number_line.n2p(pos1),
            number_line.n2p(pos2),
            buff=0.1,
            color=CONFIG["SOP_YELLOW"],
            stroke_width=6,
            max_tip_length_to_length_ratio=0.2
        )
        dx_label = MathTex("\\Delta x", color=CONFIG["SOP_YELLOW"]).next_to(displacement_vector, UP, buff=0.2)
        
        # SFX: A clean 'thwip' or 'draw' sound.
        self.play(GrowArrow(displacement_vector))
        self.play(Write(dx_label))
        self.wait(1)

        # Show equation and solve it
        equation_template = MathTex(
            "\\Delta x", "=", "x_2", "-", "x_1",
            font_size=CONFIG["EQUATION_FONT_SIZE"]
        ).to_edge(UP, buff=1)
        equation_template.set_color_by_tex("\\Delta x", CONFIG["SOP_YELLOW"])
        
        final_equation = MathTex(
            "\\Delta x = 5 - (-4) = 9",
            font_size=CONFIG["EQUATION_FONT_SIZE"]
        ).to_edge(UP, buff=1)
        final_equation.set_color_by_tex_to_color_map({
            "\\Delta x": CONFIG["SOP_YELLOW"],
            "9": CONFIG["SOP_YELLOW"]
        })
        
        self.play(Write(equation_template))
        self.wait(CONFIG["DEFAULT_WAIT"])

        # SFX: Subtle 'calculation' chimes.
        # Create separate MathTex mobjects for the numbers to transform
        num1_to_transform = MathTex(str(pos1)).move_to(label1.get_center())
        num2_to_transform = MathTex(str(pos2)).move_to(label1.get_center())

        self.play(
            Transform(num1_to_transform, final_equation.get_part_by_tex(f"({pos1})")),
            Transform(num2_to_transform, final_equation.get_part_by_tex(f"{pos2}")),
            run_time=1.5
        )
        self.remove(equation_template)
        self.play(FadeIn(final_equation))
        self.remove(num1_to_transform, num2_to_transform)
        self.wait(CONFIG["DEFAULT_WAIT"] * 2)

        # --- PART 3: DEMONSTRATING PATH INDEPENDENCE ---
        # MUSIC: A slightly more complex, questioning harmony is introduced.
        path_text = Text("But what if the journey wasn't direct?").scale(0.7).to_edge(DOWN)
        self.play(Write(path_text))

        curved_path_visual = ArcBetweenPoints(
            number_line.n2p(pos1),
            number_line.n2p(pos2),
            angle=PI / 2
        ).set_color(CONFIG["SOP_GREEN"])
        traced_path = TracedPath(particle.get_center, stroke_color=CONFIG["SOP_GREEN"], stroke_width=4, dissipating_time=1.5)
        
        self.play(FadeOut(line1, label1))
        self.add(traced_path)
        self.play(
            MoveAlongPath(particle, curved_path_visual),
            run_time=CONFIG["PARTICLE_MOVE_DURATION"] * 1.5,
            rate_func=there_and_back
        )
        self.remove(traced_path)

        # SFX: A final 'confirm' chime.
        self.play(Flash(displacement_vector, color=WHITE, line_length=0.3, num_lines=12, time_width=0.3), Flash(final_equation, color=WHITE))
        self.wait(CONFIG["DEFAULT_WAIT"])

        # --- PART 4: VISUALIZING NEGATIVE DISPLACEMENT ---
        self.play(
            FadeOut(particle, displacement_vector, dx_label, final_equation, path_text)
        )
        self.wait(1)

        pos3 = 6
        pos4 = -2
        
        # Re-using particle mobject
        particle.move_to(number_line.n2p(pos3))
        label3 = MathTex(f"x_1 = {pos3}", font_size=CONFIG["LABEL_FONT_SIZE"]).next_to(particle, UP, buff=0.5)
        self.play(FadeIn(particle), Write(label3))
        self.wait(CONFIG["DEFAULT_WAIT"])
        
        dot4 = Dot(number_line.n2p(pos4), color=CONFIG["SOP_BLUE"])
        label4 = MathTex(f"x_2 = {pos4}", font_size=CONFIG["LABEL_FONT_SIZE"]).next_to(dot4, UP, buff=0.5)

        self.play(
            Transform(particle, dot4),
            Transform(label3, label4),
            run_time=CONFIG["PARTICLE_MOVE_DURATION"]
        )
        self.wait(1)

        neg_displacement_vector = Arrow(
            number_line.n2p(pos3),
            number_line.n2p(pos4),
            buff=0.1,
            color=CONFIG["SOP_YELLOW"],
            stroke_width=6,
            max_tip_length_to_length_ratio=0.2
        )
        neg_dx_label = MathTex("\\Delta x", color=CONFIG["SOP_YELLOW"]).next_to(neg_displacement_vector, UP)
        
        self.play(GrowArrow(neg_displacement_vector))
        self.play(Write(neg_dx_label))
        self.wait(0.5)

        neg_equation = MathTex(
            "\\Delta x", "=", "x_2", "-", "x_1",
            font_size=CONFIG["EQUATION_FONT_SIZE"]
        ).to_edge(UP)
        neg_equation.set_color_by_tex("\\Delta x", CONFIG["SOP_YELLOW"])

        final_neg_equation = MathTex(
            "\\Delta x = (-2) - 6 = -8",
            font_size=CONFIG["EQUATION_FONT_SIZE"]
        ).to_edge(UP, buff=1)
        final_neg_equation.set_color_by_tex_to_color_map({
            "\\Delta x": CONFIG["SOP_YELLOW"],
            "-8": CONFIG["SOP_RED"]
        })
        
        # Create a snapshot of the labels for the negative displacement part
        source_label3 = MathTex(f"x_1 = {pos3}").move_to(label3.get_center())
        source_label4 = MathTex(f"x_2 = {pos4}").move_to(label3.get_center())

        temp_neg_eq = neg_equation.copy()
        self.play(
            TransformFromCopy(source_label3.get_part_by_tex(str(pos3)), temp_neg_eq.get_part_by_tex("x_1")),
            TransformFromCopy(source_label4.get_part_by_tex(str(pos4)), temp_neg_eq.get_part_by_tex("x_2")),
            run_time=1.5
        )
        self.wait(0.5)

        self.play(Write(neg_equation))
        self.wait(CONFIG["DEFAULT_WAIT"])
        
        num3_to_transform = MathTex(str(pos3)).move_to(label3.get_center())
        num4_to_transform = MathTex(f"({pos4})").move_to(label3.get_center())

        self.play(
            Transform(num3_to_transform, final_neg_equation.get_part_by_tex(f"{pos3}")),
            Transform(num4_to_transform, final_neg_equation.get_part_by_tex(f"({pos4})")),
            run_time=1.5
        )
        self.remove(neg_equation)
        self.play(FadeIn(final_neg_equation))
        self.remove(num3_to_transform, num4_to_transform)
        self.play(Indicate(final_neg_equation.get_part_by_tex("-8"), color=CONFIG["SOP_RED"], scale_factor=1.5))
        self.wait(CONFIG["DEFAULT_WAIT"] * 2)

        # --- FINAL CLEANUP ---
        self.play(
            *[FadeOut(mob) for mob in self.mobjects if mob is not None and mob != self.particle_system]
        )
        self.particle_system.cleanup_particles()
        self.wait() 