#include <boost/variant.hpp>
#include <iostream>
#include <string>
#include <stdio.h>
#include <stdexcept>
#include <typeinfo>

#define BOOST_NO_EXCEPTIONS
#define BOOST_EXCEPTION_DISABLE

extern "C" {
  void * __cxa_allocate_exception(size_t) { abort(); }
  void __cxa_throw(void *, std::type_info *, void *(_LIBCXXABI_DTOR_FUNC *)(void *)) { abort(); }
}

#include <rapidxml_ns/rapidxml_ns.hpp>
#include <svgpp/policy/xml/rapidxml_ns.hpp>
#include <svgpp/svgpp.hpp>

using namespace svgpp;

typedef rapidxml_ns::xml_node<> const * xml_element_t;

class Context
{
public: 
  template<class ElementTag>
  void on_enter_element(ElementTag)
  {
    if (boost::is_same<ElementTag, tag::element::path>::value)
    {
      fprintf(stderr, "{\n\tconst path = new Path2D();\n");
      fflush(stderr);
    }
  }

  void on_exit_element()
  { }

  void set(tag::attribute::stroke_width, double val) 
  {
    fprintf(stderr, "ctx.lineWidth = %g;\n", val);
    fflush(stderr);
  }

  void transform_matrix(const boost::array<double, 6> & matrix)
  {
    fprintf(stderr, "ctx.setTransform(%g, %g, %g, %g, %g, %g);\n",
            matrix[0], matrix[1], matrix[2], 
            matrix[3], matrix[4], matrix[5]);
    fflush(stderr);
  }

  void set_viewport(double viewport_x, double viewport_y, double viewport_width, double viewport_height)
  {
    fprintf(stderr, "// viewport(%g, %g, %g, %g);\n",
            viewport_x, viewport_y, viewport_width, viewport_height);
    fflush(stderr);
  }

  void set_viewbox_size(double viewbox_width, double viewbox_height)
  {
    fprintf(stderr, "// viewBox(0, 0, %g, %g);\n",
            viewbox_width, viewbox_height);
    fflush(stderr);
  }

  void disable_rendering()
  { }

  void path_move_to(double x, double y, tag::coordinate::absolute)
  {
    fprintf(stderr, "path.moveTo(%g, %g);\n", x, y);
    fflush(stderr);
  }

  void path_line_to(double x, double y, tag::coordinate::absolute)
  {
    fprintf(stderr, "path.lineTo(%g, %g);\n", x, y);
    fflush(stderr);
  }

  void path_cubic_bezier_to(
    double x1, double y1,
    double x2, double y2,
    double x, double y,
    tag::coordinate::absolute)
  {
    fprintf(stderr, "path.bezierCurveTo(%g, %g, %g, %g, %g, %g);\n",
            x1, y1, x2, y2, x, y);
    fflush(stderr);
  }

  void path_quadratic_bezier_to(
    double x1, double y1,
    double x, double y,
    tag::coordinate::absolute)
  {
    fprintf(stderr, "path.quadraticCurveTo(%g, %g, %g, %g);\n",
            x1, y1, x, y);
    fflush(stderr);
  }

  void path_elliptical_arc_to(
    double rx, double ry, double x_axis_rotation,
    bool large_arc_flag, bool sweep_flag,
    double x, double y,
    tag::coordinate::absolute)
  {
    fprintf(stderr, "path.ellipse(%g, %g, %g, %g, %g, %d, %d);\n",
            rx, ry, x_axis_rotation,
            large_arc_flag ? 1 : 0, sweep_flag ? 1 : 0, x, y);
    fflush(stderr);
  }

  void path_close_subpath()
  {
    fprintf(stderr, "path.closePath();\n");
    fflush(stderr);
  }

  void path_exit()
  {
    fprintf(stderr, "ctx.fill(path);\n}\n");
    fflush(stderr);
  }
};

typedef 
  boost::mpl::set<
    // SVG Structural Elements
    tag::element::svg,
    tag::element::g,
    // SVG Shape Elements
    tag::element::circle,
    tag::element::ellipse,
    tag::element::line,
    tag::element::path,
    tag::element::polygon,
    tag::element::polyline,
    tag::element::rect
  >::type processed_elements_t;

// This cryptic code just merges predefined sequences traits::shapes_attributes_by_element
// and traits::viewport_attributes with tag::attribute::transform attribute into single MPL sequence
typedef 
  boost::mpl::fold<
    boost::mpl::protect<
      boost::mpl::joint_view<
        traits::shapes_attributes_by_element, 
        traits::viewport_attributes
      >
    >,
    boost::mpl::set<
      tag::attribute::transform,
      tag::attribute::stroke_width
    >::type,
    boost::mpl::insert<boost::mpl::_1, boost::mpl::_2>
  >::type processed_attributes_t;

void loadSvg(xml_element_t xml_root_element)
{
  Context context;
  document_traversal<
    processed_elements<processed_elements_t>,
    processed_attributes<processed_attributes_t>,
    viewport_policy<policy::viewport::as_transform>
  >::load_document(xml_root_element, context);
}

extern "C" void parseSvg(const char* svgText) {
  rapidxml_ns::xml_document<> doc;    // Character type defaults to char
  doc.parse<0>(const_cast<char*>(svgText));  // rapidxml requires non-const char*
  if (rapidxml_ns::xml_node<> * svg_element = doc.first_node("svg"))
  {
    loadSvg(svg_element);
  }
}

// Wasi produces a reference to this in __main_void.c even though the linker
// Won't call it with .entry = .disabled
int main() {
  return 0;
}