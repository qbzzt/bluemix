(ns action.core (:require clojure.string))


(def header (clojure.string/join [

  "<html>"
  "<head>"
  "<title>Clojure OpenWhisk Inventory Management</title>"
;  "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js\">"
;  "</script>"

  "<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css\">"
  "<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap-theme.min.css\">"
  "<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js\"></script>"
  "</head>"
  "<body>"

  ]))


(defn cljsMain [params] (
    let [
      cljParams (js->clj params)
      table (get cljParams "html")

    ]

    {"html" (clojure.string/join [header table])}
  )
)
