#include <iostream>
#include <string>
#include <stdio.h>
#include <stdexcept>
#include <typeinfo>
#include <parse_svg.h>

#include <rapidxml_ns/rapidxml_ns.hpp>
#include <svgpp/policy/xml/rapidxml_ns.hpp>
#include <svgpp/svgpp.hpp>
#include <boost/variant.hpp>

extern "C" {
  void * __cxa_allocate_exception(size_t) { abort(); }
  void __cxa_throw(void *, std::type_info *, void *(_LIBCXXABI_DTOR_FUNC *)(void *)) { abort(); }
}

using namespace svgpp;

typedef rapidxml_ns::xml_node<> const * xml_element_t;

class Context 
{
public:
  template<class ElementTag>
  void on_enter_element(ElementTag) {    
    if constexpr (std::is_same_v<ElementTag, tag::element::path>) {
        std::ios_base::Init init;
        std::cout << "{\n\tconst path = new Path2D();" << std::endl;
    }
    else if constexpr (std::is_same_v<ElementTag, tag::element::clipPath>) {
        std::ios_base::Init init;
        std::cout << "path.save();\n\npath.clip();" << std::endl;
    }
  }

  void on_exit_element() { }

  void set(tag::attribute::stroke_width, double val) 
  {
    std::ios_base::Init init;
    std::cout << "ctx.lineWidth = " << val << ";" << std::endl;
  }

  void transform_matrix(const boost::array<double, 6> & matrix)
  {
    std::ios_base::Init init;
    std::cout << "ctx.setTransform(" 
              << matrix[0] << ", " << matrix[1] << ", " << matrix[2] << ", "
              << matrix[3] << ", " << matrix[4] << ", " << matrix[5] << ");" << std::endl;
  }

  void set_viewport(double viewport_x, double viewport_y, double viewport_width, double viewport_height)
  {
    std::ios_base::Init init;
    std::cout << "// viewport(" << viewport_x << ", " << viewport_y 
              << ", " << viewport_width << ", " << viewport_height << ");" << std::endl;
  }

  void set_viewbox_size(double viewbox_width, double viewbox_height)
  {
    std::ios_base::Init init;
    std::cout << "// viewBox(0, 0, " << viewbox_width << ", " << viewbox_height << ");" << std::endl;
  }

  void disable_rendering()
  {}

  void path_move_to(double x, double y, tag::coordinate::absolute)
  {
    std::ios_base::Init init;
    std::cout << "path.moveTo(" << x << ", " << y << ");" << std::endl;
  }

  void path_line_to(double x, double y, tag::coordinate::absolute)
  {
    std::ios_base::Init init;
    std::cout << "path.lineTo(" << x << ", " << y << ");" << std::endl;
  }

  void path_cubic_bezier_to(double x1, double y1, double x2, double y2, double x, double y, tag::coordinate::absolute)
  {
    std::ios_base::Init init;
    std::cout << "path.bezierCurveTo(" 
              << x1 << ", " << y1 << ", " << x2 << ", " << y2 << ", " << x << ", " << y << ");" << std::endl;
  }

  void path_quadratic_bezier_to(double x1, double y1, double x, double y, tag::coordinate::absolute)
  {
    std::ios_base::Init init;
    std::cout << "path.quadraticCurveTo(" 
              << x1 << ", " << y1 << ", " << x << ", " << y << ");" << std::endl;
  }

  void path_elliptical_arc_to(double rx, double ry, double x_axis_rotation, bool large_arc_flag, bool sweep_flag, double x, double y, tag::coordinate::absolute)
  {
    std::ios_base::Init init;
    std::cout << "path.ellipse(" 
              << rx << ", " << ry << ", " << x_axis_rotation << ", "
              << (large_arc_flag ? 1 : 0) << ", " << (sweep_flag ? 1 : 0) << ", "
              << x << ", " << y << ");" << std::endl;
  }

  void path_close_subpath()
  {
    std::ios_base::Init init;
    std::cout << "path.closePath();" << std::endl;
  }

  void path_exit()
  {
    std::ios_base::Init init;
    std::cout << "ctx.fill(path);\n}" << std::endl;
  }
};

typedef 
  boost::mpl::fold<
    boost::mpl::set<
      tag::element::svg,
      tag::element::clipPath
    >::type,
    traits::shape_elements,
    boost::mpl::insert<boost::mpl::_1, boost::mpl::_2>
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

typedef
  document_traversal<
    processed_elements<processed_elements_t>,
    processed_attributes<processed_attributes_t>,
    viewport_policy<policy::viewport::as_transform>
  > document_traversal_t;

void loadSvg(xml_element_t xml_root_element)
{
  Context context;
  document_traversal_t::load_document(xml_root_element, context);
}

extern "C" void parseSvg(const char* svgText, CanvasContext* ctx) {
  std::ios_base::Init init;
  std::cout << ctx->id << std::endl;

  rapidxml_ns::xml_document<> doc;
  doc.parse<0>(const_cast<char*>(svgText));
  if (rapidxml_ns::xml_node<> * svg_element = doc.first_node("svg"))
  {
    loadSvg(svg_element);
  }
}
